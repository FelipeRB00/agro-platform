from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.lista_compra import ListaCompra, ItemLista
from app.models.agricultor import Agricultor
from app.models.catalogo import CatalogoProveedor
from app.models.alerta import Alerta
from app.schemas.lista_compra import ListaCompraCreate, ListaCompraResponse
from app.core.dependencies import get_current_user, require_rol
from app.models.usuario import Usuario
from app.models.insumo import Insumo
from app.models.proveedor import Proveedor as ProveedorModel
from app.core.websocket_manager import manager
import asyncio
import threading

router = APIRouter(prefix="/listas", tags=["Listas de Compra"])

def get_agricultor(db: Session, usuario: Usuario):
    agricultor = db.query(Agricultor).filter(
        Agricultor.usuario_id == usuario.id
    ).first()
    if not agricultor:
        raise HTTPException(status_code=404, detail="Perfil de agricultor no encontrado")
    return agricultor

@router.post("/", response_model=ListaCompraResponse)
def crear_lista(
    data: ListaCompraCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)

    if not data.titulo or not data.titulo.strip():
        raise HTTPException(status_code=400, detail="El título no puede estar vacío")

    if not data.items or len(data.items) == 0:
        raise HTTPException(status_code=400, detail="La lista debe tener al menos un ítem")

    for item_data in data.items:
        insumo = db.query(Insumo).filter(Insumo.id == item_data.insumo_id).first()
        if not insumo:
            raise HTTPException(
                status_code=404,
                detail=f"El insumo con ID {item_data.insumo_id} no existe"
            )
        if item_data.cantidad <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"La cantidad del insumo {insumo.nombre} debe ser mayor a 0"
            )

    try:
        lista = ListaCompra(
            agricultor_id=agricultor.id,
            titulo=data.titulo.strip(),
            estado=data.estado
        )
        db.add(lista)
        db.flush()

        for item_data in data.items:
            item = ItemLista(
                lista_id=lista.id,
                insumo_id=item_data.insumo_id,
                cantidad=item_data.cantidad,
                unidad_medida=item_data.unidad_medida,
                nota=item_data.nota
            )
            db.add(item)

        db.commit()
        db.refresh(lista)
        return lista

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear lista: {str(e)}")


@router.get("/", response_model=List[ListaCompraResponse])
def mis_listas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)
    return db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor.id
    ).order_by(ListaCompra.creado_en.desc()).all()


@router.get("/resumen")
def resumen_agricultor(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)

    from app.models.cotizacion import Cotizacion

    total_listas = db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor.id
    ).count()

    listas_publicadas = db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor.id,
        ListaCompra.estado == "publicada"
    ).count()

    listas_ids = [l.id for l in db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor.id
    ).all()]

    cotizaciones_pendientes = db.query(Cotizacion).filter(
        Cotizacion.lista_id.in_(listas_ids),
        Cotizacion.estado == "pendiente"
    ).count() if listas_ids else 0

    listas_recientes = db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor.id
    ).order_by(ListaCompra.creado_en.desc()).limit(5).all()

    actividad = []
    for lista in listas_recientes:
        actividad.append({
            "tipo": "lista",
            "titulo": lista.titulo,
            "estado": lista.estado,
            "fecha": lista.creado_en,
            "items": len(lista.items)
        })

    return {
        "total_listas": total_listas,
        "listas_activas": listas_publicadas,
        "cotizaciones_pendientes": cotizaciones_pendientes,
        "actividad_reciente": actividad
    }


@router.get("/{lista_id}", response_model=ListaCompraResponse)
def detalle_lista(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)
    lista = db.query(ListaCompra).filter(
        ListaCompra.id == lista_id,
        ListaCompra.agricultor_id == agricultor.id
    ).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    return lista


@router.post("/{lista_id}/publicar", response_model=ListaCompraResponse)
def publicar_lista(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)
    lista = db.query(ListaCompra).filter(
        ListaCompra.id == lista_id,
        ListaCompra.agricultor_id == agricultor.id
    ).first()

    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")

    if lista.estado != "borrador":
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden publicar listas en borrador"
        )

    lista.estado = "publicada"

    insumo_ids = [item.insumo_id for item in lista.items]
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.insumo_id.in_(insumo_ids),
        CatalogoProveedor.activo == True
    ).all()

    proveedores_alertados = set()
    for catalogo in catalogos:
        if catalogo.proveedor_id not in proveedores_alertados:
            alerta = Alerta(
                lista_id=lista.id,
                proveedor_id=catalogo.proveedor_id
            )
            db.add(alerta)
            proveedores_alertados.add(catalogo.proveedor_id)

    db.commit()
    db.refresh(lista)

    # ✅ Notificar a proveedores en tiempo real con threading
    proveedor_usuario_ids = []
    for catalogo in catalogos:
        prov = db.query(ProveedorModel).filter(
            ProveedorModel.id == catalogo.proveedor_id
        ).first()
        if prov:
            proveedor_usuario_ids.append(prov.usuario_id)

    if proveedor_usuario_ids:
        ids_copia = list(proveedor_usuario_ids)
        titulo_copia = lista.titulo
        lista_id_copia = lista.id

        def notificar():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(manager.broadcast_to_users(
                ids_copia,
                {
                    "tipo": "nueva_solicitud",
                    "mensaje": f"Nueva solicitud: {titulo_copia}",
                    "lista_id": lista_id_copia,
                    "titulo": titulo_copia
                }
            ))
            loop.close()

        threading.Thread(target=notificar, daemon=True).start()

    return lista


@router.delete("/{lista_id}")
def eliminar_lista(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)
    lista = db.query(ListaCompra).filter(
        ListaCompra.id == lista_id,
        ListaCompra.agricultor_id == agricultor.id
    ).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    if lista.estado == "publicada":
        raise HTTPException(status_code=400, detail="No se puede eliminar una lista publicada")

    db.delete(lista)
    db.commit()
    return {"message": "Lista eliminada"}
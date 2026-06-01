from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.database import get_db
from app.models.cotizacion import Cotizacion, ItemCotizacion
from app.models.lista_compra import ListaCompra, ItemLista
from app.models.alerta import Alerta
from app.models.proveedor import Proveedor
from app.models.agricultor import Agricultor
from app.models.insumo import Insumo
from app.schemas.cotizacion import CotizacionCreate, CotizacionResponse
from app.core.dependencies import require_rol
from app.models.usuario import Usuario
from app.core.websocket_manager import manager
import asyncio
import threading

router = APIRouter(tags=["Cotizaciones"])


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def get_proveedor(db, usuario):
    proveedor = db.query(Proveedor).filter(
        Proveedor.usuario_id == usuario.id
    ).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Perfil de proveedor no encontrado")
    return proveedor


def get_agricultor(db, usuario):
    agricultor = db.query(Agricultor).filter(
        Agricultor.usuario_id == usuario.id
    ).first()
    if not agricultor:
        raise HTTPException(status_code=404, detail="Perfil de agricultor no encontrado")
    return agricultor


# ─────────────────────────────────────────────────────────────
# ALERTAS
# ─────────────────────────────────────────────────────────────

@router.get("/alertas/", tags=["Alertas"])
def mis_alertas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    alertas = db.query(Alerta).filter(
        Alerta.proveedor_id == proveedor.id
    ).order_by(Alerta.creado_en.desc()).all()

    resultado = []
    for alerta in alertas:
        lista = db.query(ListaCompra).filter(ListaCompra.id == alerta.lista_id).first()
        if not lista:
            continue

        agricultor = db.query(Agricultor).filter(Agricultor.id == lista.agricultor_id).first()
        usuario_agr = agricultor.usuario if agricultor else None

        items = []
        for item in lista.items:
            insumo = db.query(Insumo).filter(Insumo.id == item.insumo_id).first()
            items.append({
                "id": item.id,
                "insumo_nombre": insumo.nombre if insumo else "",
                "insumo_categoria": insumo.categoria if insumo else "",
                "cantidad": float(item.cantidad),
                "unidad_medida": item.unidad_medida,
                "nota": item.nota
            })

        resultado.append({
            "alerta_id": alerta.id,
            "lista_id": lista.id,
            "titulo_lista": lista.titulo,
            "estado_lista": lista.estado,
            "leida": alerta.leida,
            "creado_en": alerta.creado_en,
            "agricultor_nombre": usuario_agr.nombre if usuario_agr else "Agricultor",
            "agricultor_region": agricultor.region if agricultor else "",
            "items": items
        })

    return resultado


@router.put("/alertas/{alerta_id}/leer", tags=["Alertas"])
def marcar_leida(
    alerta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    alerta = db.query(Alerta).filter(
        Alerta.id == alerta_id,
        Alerta.proveedor_id == proveedor.id
    ).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    alerta.leida = True
    db.commit()
    return {"message": "Alerta marcada como leída"}


# ─────────────────────────────────────────────────────────────
# CREAR COTIZACIÓN
# ─────────────────────────────────────────────────────────────

@router.post("/cotizaciones/", response_model=CotizacionResponse, tags=["Cotizaciones"])
def crear_cotizacion(
    data: CotizacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)

    lista = db.query(ListaCompra).filter(ListaCompra.id == data.lista_id).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    if lista.estado != "publicada":
        raise HTTPException(status_code=400, detail="Solo se puede cotizar listas publicadas")

    existente = db.query(Cotizacion).filter(
        Cotizacion.lista_id == data.lista_id,
        Cotizacion.proveedor_id == proveedor.id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya enviaste una cotización para esta lista")

    if not data.items or len(data.items) == 0:
        raise HTTPException(status_code=400, detail="Debes cotizar al menos un ítem")

    items_lista_validos = {
        item.id: item
        for item in db.query(ItemLista).filter(ItemLista.lista_id == data.lista_id).all()
    }
    if not items_lista_validos:
        raise HTTPException(status_code=400, detail="La lista no tiene ítems")

    ids_recibidos = [item.item_lista_id for item in data.items]
    if len(ids_recibidos) != len(set(ids_recibidos)):
        raise HTTPException(status_code=400, detail="No puedes repetir ítems en la cotización")

    for item_data in data.items:
        if item_data.item_lista_id not in items_lista_validos:
            raise HTTPException(
                status_code=400,
                detail=f"El ítem {item_data.item_lista_id} no pertenece a esta lista"
            )
        if item_data.precio_unitario <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"El precio del ítem {item_data.item_lista_id} debe ser mayor a 0"
            )
        if item_data.cantidad_ofrecida <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"La cantidad del ítem {item_data.item_lista_id} debe ser mayor a 0"
            )

    try:
        cotizacion = Cotizacion(
            lista_id=data.lista_id,
            proveedor_id=proveedor.id,
            estado="pendiente",
            nota=data.nota
        )
        db.add(cotizacion)
        db.flush()

        for item_data in data.items:
            subtotal = item_data.precio_unitario * item_data.cantidad_ofrecida
            item = ItemCotizacion(
                cotizacion_id=cotizacion.id,
                item_lista_id=item_data.item_lista_id,
                precio_unitario=item_data.precio_unitario,
                cantidad_ofrecida=item_data.cantidad_ofrecida,
                subtotal=subtotal
            )
            db.add(item)

        db.commit()
        db.refresh(cotizacion)

        # ✅ Notificar al agricultor en tiempo real con threading
        agr = db.query(Agricultor).filter(Agricultor.id == lista.agricultor_id).first()
        if agr:
            usuario_id_copia = agr.usuario_id
            titulo_copia = lista.titulo
            cotizacion_id_copia = cotizacion.id
            lista_id_copia = lista.id

            def notificar_agricultor():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(manager.send_to_user(
                    usuario_id_copia,
                    {
                        "tipo": "nueva_cotizacion",
                        "mensaje": f"Nueva cotización para: {titulo_copia}",
                        "lista_id": lista_id_copia,
                        "cotizacion_id": cotizacion_id_copia
                    }
                ))
                loop.close()

            threading.Thread(target=notificar_agricultor, daemon=True).start()

        return cotizacion

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno al crear la cotización")


# ─────────────────────────────────────────────────────────────
# MIS COTIZACIONES (PROVEEDOR)
# ─────────────────────────────────────────────────────────────

@router.get("/cotizaciones/mis-cotizaciones/", tags=["Cotizaciones"])
def mis_cotizaciones_proveedor(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    cotizaciones = db.query(Cotizacion).filter(
        Cotizacion.proveedor_id == proveedor.id
    ).order_by(Cotizacion.creado_en.desc()).all()

    resultado = []
    for c in cotizaciones:
        lista = db.query(ListaCompra).filter(ListaCompra.id == c.lista_id).first()
        total = sum(float(i.subtotal or 0) for i in c.items)
        resultado.append({
            "id": c.id,
            "lista_titulo": lista.titulo if lista else "",
            "estado": c.estado,
            "total": total,
            "nota": c.nota,
            "creado_en": c.creado_en,
            "items_count": len(c.items)
        })

    return resultado


# ─────────────────────────────────────────────────────────────
# HISTORIAL PEDIDOS
# IMPORTANTE: debe ir ANTES de rutas con {cotizacion_id}
# ─────────────────────────────────────────────────────────────

@router.get("/cotizaciones/pedidos/historial", tags=["Pedidos"])
def historial_pedidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)
    listas = db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor.id,
        ListaCompra.estado == "cerrada"
    ).order_by(ListaCompra.creado_en.desc()).all()

    resultado = []
    for lista in listas:
        cotizacion = db.query(Cotizacion).filter(
            Cotizacion.lista_id == lista.id,
            Cotizacion.estado == "aceptada"
        ).first()
        if not cotizacion:
            continue

        proveedor = db.query(Proveedor).filter(Proveedor.id == cotizacion.proveedor_id).first()
        total = sum(float(i.subtotal or 0) for i in cotizacion.items)

        resultado.append({
            "id": f"#ORD-{lista.id:04d}",
            "lista_id": lista.id,
            "cotizacion_id": cotizacion.id,
            "fecha": lista.creado_en,
            "titulo": lista.titulo,
            "proveedor": proveedor.nombre_empresa if proveedor else "Desconocido",
            "total": total,
            "estado": lista.estado,
            "items_count": len(lista.items)
        })

    return resultado


# ─────────────────────────────────────────────────────────────
# COTIZACIONES POR LISTA
# ─────────────────────────────────────────────────────────────

@router.get("/cotizaciones/por-lista/{lista_id}", tags=["Cotizaciones"])
def cotizaciones_por_lista(
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

    cotizaciones = db.query(Cotizacion).filter(Cotizacion.lista_id == lista_id).all()

    resultado = []
    for c in cotizaciones:
        proveedor = db.query(Proveedor).filter(Proveedor.id == c.proveedor_id).first()
        total = sum(float(i.subtotal or 0) for i in c.items)
        items = []
        for i in c.items:
            item_lista = db.query(ItemLista).filter(ItemLista.id == i.item_lista_id).first()
            insumo = db.query(Insumo).filter(Insumo.id == item_lista.insumo_id).first() if item_lista else None
            items.append({
                "id": i.id,
                "insumo_nombre": insumo.nombre if insumo else "",
                "precio_unitario": float(i.precio_unitario),
                "cantidad_ofrecida": float(i.cantidad_ofrecida),
                "subtotal": float(i.subtotal or 0)
            })

        resultado.append({
            "id": c.id,
            "proveedor_nombre": proveedor.nombre_empresa if proveedor else "",
            "estado": c.estado,
            "total": total,
            "nota": c.nota,
            "creado_en": c.creado_en,
            "items": items
        })

    return resultado


# ─────────────────────────────────────────────────────────────
# ACEPTAR COTIZACIÓN
# ─────────────────────────────────────────────────────────────

@router.put("/cotizaciones/{cotizacion_id}/aceptar", tags=["Cotizaciones"])
def aceptar_cotizacion(
    cotizacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = get_agricultor(db, current_user)
    cotizacion = db.query(Cotizacion).filter(Cotizacion.id == cotizacion_id).first()
    if not cotizacion:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

    if cotizacion.estado != "pendiente":
        raise HTTPException(status_code=400, detail="La cotización ya fue procesada")

    lista = db.query(ListaCompra).filter(
        ListaCompra.id == cotizacion.lista_id,
        ListaCompra.agricultor_id == agricultor.id
    ).first()
    if not lista:
        raise HTTPException(status_code=403, detail="No autorizado")

    cotizacion.estado = "aceptada"
    db.query(Cotizacion).filter(
        Cotizacion.lista_id == cotizacion.lista_id,
        Cotizacion.id != cotizacion_id
    ).update({"estado": "rechazada"})

    lista.estado = "cerrada"
    db.commit()

    return {"message": "Cotización aceptada exitosamente"}
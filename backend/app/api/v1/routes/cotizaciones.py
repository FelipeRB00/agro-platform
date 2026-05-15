from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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

router = APIRouter(tags=["Cotizaciones"])

def get_proveedor(db, usuario):
    p = db.query(Proveedor).filter(Proveedor.usuario_id == usuario.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Perfil de proveedor no encontrado")
    return p

def get_agricultor(db, usuario):
    a = db.query(Agricultor).filter(Agricultor.usuario_id == usuario.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Perfil de agricultor no encontrado")
    return a

# ─── ALERTAS ────────────────────────────────────────────────

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

# ─── COTIZACIONES ────────────────────────────────────────────

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

    cotizacion = Cotizacion(
        lista_id=data.lista_id,
        proveedor_id=proveedor.id,
        estado="pendiente",
        nota=data.nota
    )
    db.add(cotizacion)
    db.flush()

    for item_data in data.items:
        item_lista = db.query(ItemLista).filter(ItemLista.id == item_data.item_lista_id).first()
        if not item_lista:
            continue
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
    return cotizacion

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

    cotizaciones = db.query(Cotizacion).filter(
        Cotizacion.lista_id == lista_id
    ).all()

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
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.catalogo import CatalogoProveedor
from app.models.proveedor import Proveedor
from app.models.insumo import Insumo
from app.schemas.catalogo import CatalogoCreate, CatalogoUpdate
from app.core.dependencies import require_rol
from app.models.usuario import Usuario
from datetime import datetime

router = APIRouter(prefix="/catalogo", tags=["Catálogo Proveedor"])

def get_proveedor(db: Session, usuario: Usuario):
    proveedor = db.query(Proveedor).filter(
        Proveedor.usuario_id == usuario.id
    ).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Perfil de proveedor no encontrado")
    return proveedor

@router.get("/")
def mi_catalogo(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.proveedor_id == proveedor.id
    ).all()

    resultado = []
    for c in catalogos:
        insumo = db.query(Insumo).filter(Insumo.id == c.insumo_id).first()
        resultado.append({
            "id": c.id,
            "insumo_id": c.insumo_id,
            "nombre": insumo.nombre if insumo else "",
            "categoria": insumo.categoria if insumo else "",
            "unidad_medida": insumo.unidad_medida if insumo else "",
            "precio_referencia": float(c.precio_referencia or 0),
            "stock_disponible": c.stock_disponible or 0,
            "activo": c.activo,
            "actualizado_en": c.actualizado_en
        })
    return resultado

@router.post("/")
def agregar_producto(
    data: CatalogoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)

    # Validar precio
    if data.precio_referencia <= 0:
        raise HTTPException(status_code=400, detail="El precio debe ser mayor a 0")

    # Validar stock
    if data.stock_disponible < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")

    # Verificar que el insumo existe
    insumo = db.query(Insumo).filter(Insumo.id == data.insumo_id).first()
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")

    # Verificar que no esté duplicado
    existente = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.proveedor_id == proveedor.id,
        CatalogoProveedor.insumo_id == data.insumo_id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este insumo ya está en tu catálogo")

    try:
        catalogo = CatalogoProveedor(
            proveedor_id=proveedor.id,
            insumo_id=data.insumo_id,
            precio_referencia=data.precio_referencia,
            stock_disponible=data.stock_disponible,
            activo=True
        )
        db.add(catalogo)
        db.commit()
        db.refresh(catalogo)

        return {
            "id": catalogo.id,
            "insumo_id": catalogo.insumo_id,
            "nombre": insumo.nombre,
            "categoria": insumo.categoria,
            "unidad_medida": insumo.unidad_medida,
            "precio_referencia": float(catalogo.precio_referencia),
            "stock_disponible": catalogo.stock_disponible,
            "activo": catalogo.activo,
            "actualizado_en": catalogo.actualizado_en
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al agregar producto: {str(e)}")

@router.put("/{catalogo_id}")
def actualizar_producto(
    catalogo_id: int,
    data: CatalogoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    catalogo = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.id == catalogo_id,
        CatalogoProveedor.proveedor_id == proveedor.id
    ).first()
    if not catalogo:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Validar precio si se envía
    if data.precio_referencia is not None and data.precio_referencia <= 0:
        raise HTTPException(status_code=400, detail="El precio debe ser mayor a 0")

    # Validar stock si se envía
    if data.stock_disponible is not None and data.stock_disponible < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")

    try:
        if data.precio_referencia is not None:
            catalogo.precio_referencia = data.precio_referencia
        if data.stock_disponible is not None:
            catalogo.stock_disponible = data.stock_disponible
        if data.activo is not None:
            catalogo.activo = data.activo

        catalogo.actualizado_en = datetime.utcnow()
        db.commit()
        db.refresh(catalogo)

        insumo = db.query(Insumo).filter(Insumo.id == catalogo.insumo_id).first()
        return {
            "id": catalogo.id,
            "insumo_id": catalogo.insumo_id,
            "nombre": insumo.nombre if insumo else "",
            "categoria": insumo.categoria if insumo else "",
            "unidad_medida": insumo.unidad_medida if insumo else "",
            "precio_referencia": float(catalogo.precio_referencia),
            "stock_disponible": catalogo.stock_disponible,
            "activo": catalogo.activo,
            "actualizado_en": catalogo.actualizado_en
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar producto: {str(e)}")

@router.delete("/{catalogo_id}")
def eliminar_producto(
    catalogo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    catalogo = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.id == catalogo_id,
        CatalogoProveedor.proveedor_id == proveedor.id
    ).first()
    if not catalogo:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db.delete(catalogo)
    db.commit()
    return {"message": "Producto eliminado del catálogo"}
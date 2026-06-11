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


# Helper para construir la respuesta de un producto del catálogo
def serializar_catalogo(db: Session, c: CatalogoProveedor):
    if c.insumo_id:
        insumo = db.query(Insumo).filter(Insumo.id == c.insumo_id).first()
        nombre = insumo.nombre if insumo else ""
        categoria = insumo.categoria if insumo else ""
        unidad = insumo.unidad_medida if insumo else ""
    else:
        nombre = c.nombre_libre or ""
        categoria = c.categoria or "otro"
        unidad = ""

    return {
        "id": c.id,
        "insumo_id": c.insumo_id,
        "nombre_libre": c.nombre_libre,
        "nombre": nombre,
        "categoria": categoria,
        "unidad_medida": unidad,
        "precio_referencia": float(c.precio_referencia or 0),
        "stock_disponible": c.stock_disponible or 0,
        "activo": c.activo,
        "actualizado_en": c.actualizado_en
    }


@router.get("/")
def mi_catalogo(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.proveedor_id == proveedor.id
    ).all()
    return [serializar_catalogo(db, c) for c in catalogos]


@router.post("/")
def agregar_producto(
    data: CatalogoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("proveedor"))
):
    proveedor = get_proveedor(db, current_user)

    if data.precio_referencia <= 0:
        raise HTTPException(status_code=400, detail="El precio debe ser mayor a 0")
    if data.stock_disponible < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")
    if not data.insumo_id and not data.nombre_libre:
        raise HTTPException(status_code=400, detail="Debes indicar un insumo o escribir un nombre")

    # Nombre final del producto
    if data.insumo_id:
        insumo = db.query(Insumo).filter(Insumo.id == data.insumo_id).first()
        if not insumo:
            raise HTTPException(status_code=404, detail="Insumo no encontrado")
        nombre_final = insumo.nombre
    else:
        nombre_final = data.nombre_libre.strip()

    # Verificar duplicado por nombre
    existentes = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.proveedor_id == proveedor.id
    ).all()

    for e in existentes:
        if e.insumo_id:
            ins = db.query(Insumo).filter(Insumo.id == e.insumo_id).first()
            nombre_e = ins.nombre if ins else ""
        else:
            nombre_e = e.nombre_libre or ""
        if nombre_e.lower() == nombre_final.lower():
            raise HTTPException(status_code=400, detail="Este producto ya está en tu catálogo")

    try:
        catalogo = CatalogoProveedor(
            proveedor_id=proveedor.id,
            insumo_id=data.insumo_id if data.insumo_id else None,
            nombre_libre=nombre_final if not data.insumo_id else None,
            categoria=(data.categoria or "otro") if not data.insumo_id else None,
            precio_referencia=data.precio_referencia,
            stock_disponible=data.stock_disponible,
            activo=True
        )
        db.add(catalogo)
        db.commit()
        db.refresh(catalogo)
        return serializar_catalogo(db, catalogo)

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

    try:
        # Solo actualizar los campos que vienen. NUNCA tocar nombre_libre ni categoria.
        if data.precio_referencia is not None:
            if data.precio_referencia <= 0:
                raise HTTPException(status_code=400, detail="El precio debe ser mayor a 0")
            catalogo.precio_referencia = data.precio_referencia

        if data.stock_disponible is not None:
            if data.stock_disponible < 0:
                raise HTTPException(status_code=400, detail="El stock no puede ser negativo")
            catalogo.stock_disponible = data.stock_disponible

        if data.activo is not None:
            catalogo.activo = data.activo

        catalogo.actualizado_en = datetime.utcnow()

        db.commit()
        db.refresh(catalogo)
        return serializar_catalogo(db, catalogo)

    except HTTPException:
        raise
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
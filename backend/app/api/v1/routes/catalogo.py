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
        if c.insumo_id:
            insumo = db.query(Insumo).filter(Insumo.id == c.insumo_id).first()
            nombre = insumo.nombre if insumo else ""
            categoria = insumo.categoria if insumo else ""
            unidad = insumo.unidad_medida if insumo else ""
        else:
            nombre = c.nombre_libre or ""
            categoria = c.categoria or ""
            unidad = ""

        resultado.append({
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
        })
    return resultado

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
        categoria_final = insumo.categoria
        unidad_final = insumo.unidad_medida
    else:
        insumo = None
        nombre_final = data.nombre_libre.strip()
        categoria_final = data.categoria or "otro"
        unidad_final = ""

    # Verificar duplicado por nombre
    existentes = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.proveedor_id == proveedor.id
    ).all()

    for e in existentes:
        nombre_e = ""
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
            categoria=categoria_final if not data.insumo_id else None,
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
            "nombre_libre": catalogo.nombre_libre,
            "nombre": nombre_final,
            "categoria": categoria_final,
            "unidad_medida": unidad_final,
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
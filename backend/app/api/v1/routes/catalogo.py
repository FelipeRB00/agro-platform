from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
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
import os
import uuid

router = APIRouter(prefix="/catalogo", tags=["Catálogo Proveedor"])

# Extensiones de imagen permitidas
EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp"}
CARPETA_UPLOADS = "uploads/productos"


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
        "actualizado_en": c.actualizado_en,
        "ingrediente_activo": c.ingrediente_activo,
        "imagen_url": c.imagen_url
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
            ingrediente_activo=data.ingrediente_activo,
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

        if data.ingrediente_activo is not None:
            catalogo.ingrediente_activo = data.ingrediente_activo

        catalogo.actualizado_en = datetime.utcnow()

        db.commit()
        db.refresh(catalogo)
        return serializar_catalogo(db, catalogo)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar producto: {str(e)}")


@router.post("/{catalogo_id}/imagen")
def subir_imagen_producto(
    catalogo_id: int,
    file: UploadFile = File(...),
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

    # Validar extensión
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail="Formato no permitido. Usa JPG, PNG o WEBP."
        )

    # Asegurar que la carpeta existe
    os.makedirs(CARPETA_UPLOADS, exist_ok=True)

    # Nombre único para evitar colisiones
    nombre_archivo = f"{uuid.uuid4().hex}{ext}"
    ruta_archivo = os.path.join(CARPETA_UPLOADS, nombre_archivo)

    # Guardar el archivo
    try:
        contenido = file.file.read()
        # Validar tamaño máximo (5 MB)
        if len(contenido) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="La imagen no debe superar los 5 MB")
        with open(ruta_archivo, "wb") as f:
            f.write(contenido)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error al guardar la imagen")

    # Borrar imagen anterior si existía
    if catalogo.imagen_url:
        ruta_anterior = catalogo.imagen_url.lstrip("/")
        if os.path.exists(ruta_anterior):
            try:
                os.remove(ruta_anterior)
            except Exception:
                pass

    # Guardar la ruta en la BD (relativa, servida por /uploads)
    catalogo.imagen_url = f"/uploads/productos/{nombre_archivo}"
    catalogo.actualizado_en = datetime.utcnow()
    db.commit()
    db.refresh(catalogo)

    return serializar_catalogo(db, catalogo)


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

    # Borrar imagen asociada si existe
    if catalogo.imagen_url:
        ruta = catalogo.imagen_url.lstrip("/")
        if os.path.exists(ruta):
            try:
                os.remove(ruta)
            except Exception:
                pass

    db.delete(catalogo)
    db.commit()
    return {"message": "Producto eliminado del catálogo"}
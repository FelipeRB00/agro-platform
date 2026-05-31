from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import verify_password, hash_password
from app.models.usuario import Usuario
from app.models.agricultor import Agricultor
from app.models.proveedor import Proveedor
from app.schemas.usuario import UsuarioUpdate, PasswordUpdate, UsuarioResponse

router = APIRouter(prefix="/perfil", tags=["Perfil"])

@router.get("/", response_model=UsuarioResponse)
def mi_perfil(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return current_user

@router.put("/", response_model=UsuarioResponse)
def actualizar_perfil(
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if data.nombre is not None:
        if not data.nombre.strip():
            raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
        current_user.nombre = data.nombre.strip()

    if data.telefono is not None:
        current_user.telefono = data.telefono.strip() or None

    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar perfil")

@router.put("/cambiar-password")
def cambiar_password(
    data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if not verify_password(data.password_actual, current_user.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")

    if len(data.password_nuevo) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")

    if data.password_actual == data.password_nuevo:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe ser diferente a la actual")

    try:
        current_user.password_hash = hash_password(data.password_nuevo)
        db.commit()
        return {"message": "Contraseña actualizada correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al cambiar contraseña")

@router.get("/detalle")
def detalle_perfil(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    resultado = {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "email": current_user.email,
        "rut": current_user.rut,
        "telefono": current_user.telefono,
        "rol": current_user.rol,
        "activo": current_user.activo,
        "creado_en": current_user.creado_en,
        "perfil_extendido": None
    }

    if current_user.rol == "agricultor":
        agricultor = db.query(Agricultor).filter(
            Agricultor.usuario_id == current_user.id
        ).first()
        if agricultor:
            resultado["perfil_extendido"] = {
                "nombre_predio": agricultor.nombre_predio,
                "region": agricultor.region,
                "hectareas": float(agricultor.hectareas) if agricultor.hectareas else None,
                "tipo_cultivo": agricultor.tipo_cultivo
            }

    elif current_user.rol == "proveedor":
        proveedor = db.query(Proveedor).filter(
            Proveedor.usuario_id == current_user.id
        ).first()
        if proveedor:
            resultado["perfil_extendido"] = {
                "nombre_empresa": proveedor.nombre_empresa,
                "direccion": proveedor.direccion,
                "region": proveedor.region,
                "descripcion": proveedor.descripcion
            }

    return resultado

@router.put("/detalle-extendido")
def actualizar_detalle(
    data: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        if current_user.rol == "agricultor":
            agricultor = db.query(Agricultor).filter(
                Agricultor.usuario_id == current_user.id
            ).first()
            if agricultor:
                if "nombre_predio" in data:
                    agricultor.nombre_predio = data["nombre_predio"]
                if "region" in data:
                    agricultor.region = data["region"]
                if "hectareas" in data:
                    agricultor.hectareas = data["hectareas"]
                if "tipo_cultivo" in data:
                    agricultor.tipo_cultivo = data["tipo_cultivo"]

        elif current_user.rol == "proveedor":
            proveedor = db.query(Proveedor).filter(
                Proveedor.usuario_id == current_user.id
            ).first()
            if proveedor:
                if "nombre_empresa" in data:
                    proveedor.nombre_empresa = data["nombre_empresa"]
                if "direccion" in data:
                    proveedor.direccion = data["direccion"]
                if "region" in data:
                    proveedor.region = data["region"]
                if "descripcion" in data:
                    proveedor.descripcion = data["descripcion"]

        db.commit()
        return {"message": "Perfil actualizado correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar perfil extendido")
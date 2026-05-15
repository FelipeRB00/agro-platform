from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor
from app.models.agricultor import Agricultor
from app.schemas.admin import UsuarioAdminResponse, UsuarioUpdateAdmin
from app.core.dependencies import require_rol

router = APIRouter(prefix="/admin", tags=["Administración"])

@router.get("/stats")
def obtener_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    total_usuarios = db.query(Usuario).count()
    total_proveedores = db.query(Usuario).filter(Usuario.rol == "proveedor").count()
    total_agricultores = db.query(Usuario).filter(Usuario.rol == "agricultor").count()
    usuarios_activos = db.query(Usuario).filter(Usuario.activo == True).count()

    return {
        "total_usuarios": total_usuarios,
        "total_proveedores": total_proveedores,
        "total_agricultores": total_agricultores,
        "usuarios_activos": usuarios_activos,
    }

@router.get("/usuarios", response_model=List[UsuarioAdminResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    return db.query(Usuario).order_by(Usuario.creado_en.desc()).all()

@router.put("/usuarios/{usuario_id}")
def actualizar_usuario(
    usuario_id: int,
    data: UsuarioUpdateAdmin,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes modificarte a ti mismo")

    if data.activo is not None:
        usuario.activo = data.activo
    if data.rol is not None:
        usuario.rol = data.rol

    db.commit()
    db.refresh(usuario)
    return {"message": "Usuario actualizado", "usuario": usuario.nombre}

@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado"}
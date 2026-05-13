from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor
from app.models.agricultor import Agricultor
from app.schemas.usuario import UsuarioCreate, LoginRequest, TokenResponse, UsuarioResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=UsuarioResponse)
def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if db.query(Usuario).filter(Usuario.rut == data.rut).first():
        raise HTTPException(status_code=400, detail="El RUT ya está registrado")

    usuario = Usuario(
        nombre=data.nombre,
        email=data.email,
        rut=data.rut,
        telefono=data.telefono,
        rol=data.rol,
        password_hash=hash_password(data.password)
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    if data.rol == "proveedor":
        db.add(Proveedor(usuario_id=usuario.id, nombre_empresa=data.nombre))
        db.commit()
    elif data.rol == "agricultor":
        db.add(Agricultor(usuario_id=usuario.id))
        db.commit()

    return usuario

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario or not verify_password(data.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not usuario.activo:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    token = create_access_token({"sub": str(usuario.id), "rol": usuario.rol})
    return TokenResponse(access_token=token, rol=usuario.rol, nombre=usuario.nombre)
from fastapi import APIRouter, Depends, HTTPException, Request
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
    # Validar rol
    if data.rol not in ["admin", "proveedor", "agricultor"]:
        raise HTTPException(status_code=400, detail="Rol inválido")

    # Validar password mínimo
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    # Verificar duplicados
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if db.query(Usuario).filter(Usuario.rut == data.rut).first():
        raise HTTPException(status_code=400, detail="El RUT ya está registrado")

    try:
        usuario = Usuario(
            nombre=data.nombre.strip(),
            email=data.email.lower().strip(),
            rut=data.rut.strip(),
            telefono=data.telefono,
            rol=data.rol,
            password_hash=hash_password(data.password)
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        if data.rol == "proveedor":
            db.add(Proveedor(usuario_id=usuario.id, nombre_empresa=data.nombre.strip()))
            db.commit()
        elif data.rol == "agricultor":
            db.add(Agricultor(usuario_id=usuario.id))
            db.commit()

        return usuario

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al registrar usuario")

@router.post("/login", response_model=TokenResponse)
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(
        Usuario.email == data.email.lower().strip()
    ).first()

    if not usuario or not verify_password(data.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if not usuario.activo:
        raise HTTPException(status_code=403, detail="Tu cuenta está desactivada. Contacta al administrador.")

    token = create_access_token({"sub": str(usuario.id), "rol": usuario.rol})
    return TokenResponse(access_token=token, rol=usuario.rol, nombre=usuario.nombre)

@router.get("/me", response_model=UsuarioResponse)
def get_me(db: Session = Depends(get_db),
           current_user: Usuario = Depends(__import__('app.core.dependencies', fromlist=['get_current_user']).get_current_user)):
    return current_user
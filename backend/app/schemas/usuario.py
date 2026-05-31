from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rut: str
    telefono: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str
    rol: str

class UsuarioResponse(UsuarioBase):
    id: int
    rol: str
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None

class PasswordUpdate(BaseModel):
    password_actual: str
    password_nuevo: str
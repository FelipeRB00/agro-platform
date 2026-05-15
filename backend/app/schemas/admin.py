from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UsuarioAdminResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rut: str
    rol: str
    activo: bool
    telefono: Optional[str] = None
    creado_en: datetime

    class Config:
        from_attributes = True

class UsuarioUpdateAdmin(BaseModel):
    activo: Optional[bool] = None
    rol: Optional[str] = None
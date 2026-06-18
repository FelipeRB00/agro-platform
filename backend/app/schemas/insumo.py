from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InsumoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    categoria: str | None = None
    unidad_medida: str | None = None
    creado_en: datetime
    ingrediente_activo: Optional[str] = None

    class Config:
        from_attributes = True
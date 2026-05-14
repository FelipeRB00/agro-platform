from pydantic import BaseModel
from datetime import datetime

class InsumoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    categoria: str | None = None
    unidad_medida: str | None = None
    creado_en: datetime

    class Config:
        from_attributes = True
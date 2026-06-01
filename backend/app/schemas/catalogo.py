from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CatalogoCreate(BaseModel):
    insumo_id: Optional[int] = None
    nombre_libre: Optional[str] = None
    categoria: Optional[str] = None
    precio_referencia: float
    stock_disponible: int

    def validate_insumo(self):
        if not self.insumo_id and not self.nombre_libre:
            raise ValueError("Debes indicar un insumo_id o un nombre_libre")

class CatalogoUpdate(BaseModel):
    precio_referencia: Optional[float] = None
    stock_disponible: Optional[int] = None
    activo: Optional[bool] = None

class CatalogoResponse(BaseModel):
    id: int
    insumo_id: Optional[int] = None
    nombre_libre: Optional[str] = None
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    unidad_medida: Optional[str] = None
    precio_referencia: float
    stock_disponible: int
    activo: bool
    actualizado_en: datetime

    class Config:
        from_attributes = True
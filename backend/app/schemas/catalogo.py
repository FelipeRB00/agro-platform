from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CatalogoCreate(BaseModel):
    insumo_id: int
    precio_referencia: float
    stock_disponible: int

class CatalogoUpdate(BaseModel):
    precio_referencia: Optional[float] = None
    stock_disponible: Optional[int] = None
    activo: Optional[bool] = None

class CatalogoResponse(BaseModel):
    id: int
    insumo_id: int
    precio_referencia: float
    stock_disponible: int
    activo: bool
    actualizado_en: datetime
    insumo: Optional[dict] = None

    class Config:
        from_attributes = True
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ItemCotizacionCreate(BaseModel):
    item_lista_id: int
    precio_unitario: float
    cantidad_ofrecida: float

class CotizacionCreate(BaseModel):
    lista_id: int
    nota: Optional[str] = None
    items: List[ItemCotizacionCreate]
    acepta_credito: Optional[bool] = False
    dias_credito: Optional[int] = None

class ItemCotizacionResponse(BaseModel):
    id: int
    item_lista_id: int
    precio_unitario: float
    cantidad_ofrecida: float
    subtotal: Optional[float] = None

    class Config:
        from_attributes = True

class CotizacionResponse(BaseModel):
    id: int
    lista_id: int
    proveedor_id: int
    estado: str
    nota: Optional[str] = None
    creado_en: datetime
    items: List[ItemCotizacionResponse] = []
    acepta_credito: Optional[bool] = False
    dias_credito: Optional[int] = None

    class Config:
        from_attributes = True
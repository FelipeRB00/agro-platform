from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ItemListaCreate(BaseModel):
    insumo_id: int
    cantidad: float
    unidad_medida: str
    nota: Optional[str] = None

class ListaCompraCreate(BaseModel):
    titulo: str
    estado: str = "borrador"
    items: List[ItemListaCreate]

class ItemListaResponse(BaseModel):
    id: int
    insumo_id: int
    cantidad: float
    unidad_medida: str
    nota: Optional[str] = None

    class Config:
        from_attributes = True

class ListaCompraResponse(BaseModel):
    id: int
    titulo: str
    estado: str
    creado_en: datetime
    cerrado_en: Optional[datetime] = None
    items: List[ItemListaResponse] = []

    class Config:
        from_attributes = True
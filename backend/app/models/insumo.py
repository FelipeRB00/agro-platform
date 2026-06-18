from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Insumo(Base):
    __tablename__ = "insumos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String)
    categoria = Column(String(100))  # fertilizante, plaguicida, semilla, herramienta
    unidad_medida = Column(String(30))  # kg, litro, unidad, saco
    creado_en = Column(DateTime, default=datetime.utcnow)
    ingrediente_activo = Column(String, nullable=True)

    catalogo = relationship("CatalogoProveedor", back_populates="insumo")
    items_lista = relationship("ItemLista", back_populates="insumo")
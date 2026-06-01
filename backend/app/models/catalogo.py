
from sqlalchemy import Column, Integer, Numeric, Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class CatalogoProveedor(Base):
    __tablename__ = "catalogo_proveedor"

    id = Column(Integer, primary_key=True, index=True)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    insumo_id = Column(Integer, ForeignKey("insumos.id"))
    precio_referencia = Column(Numeric)
    stock_disponible = Column(Integer)
    activo = Column(Boolean, default=True)
    actualizado_en = Column(DateTime, default=datetime.utcnow)

    nombre_libre = Column(String, nullable=True)
    categoria = Column(String, nullable=True)

    proveedor = relationship("Proveedor", back_populates="catalogo")
    insumo = relationship("Insumo", back_populates="catalogo")
    historial_precios = relationship("HistorialPrecio", back_populates="catalogo")
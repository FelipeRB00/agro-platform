from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class HistorialPrecio(Base):
    __tablename__ = "historial_precios"

    id = Column(Integer, primary_key=True, index=True)
    catalogo_id = Column(Integer, ForeignKey("catalogo_proveedor.id"))
    cotizacion_id = Column(Integer, ForeignKey("cotizaciones.id"), nullable=True)
    precio = Column(Numeric, nullable=False)
    origen = Column(String(30))  # catalogo, cotizacion_aceptada
    registrado_en = Column(DateTime, default=datetime.utcnow)

    catalogo = relationship("CatalogoProveedor", back_populates="historial_precios")
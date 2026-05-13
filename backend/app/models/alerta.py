from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Alerta(Base):
    __tablename__ = "alertas"

    id = Column(Integer, primary_key=True, index=True)
    lista_id = Column(Integer, ForeignKey("listas_compra.id"))
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    leida = Column(Boolean, default=False)
    creado_en = Column(DateTime, default=datetime.utcnow)

    lista = relationship("ListaCompra", back_populates="alertas")
    proveedor = relationship("Proveedor", back_populates="alertas")
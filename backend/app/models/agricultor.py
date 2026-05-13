from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Agricultor(Base):
    __tablename__ = "agricultores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    nombre_predio = Column(String(150))
    region = Column(String(100))
    hectareas = Column(Numeric)
    tipo_cultivo = Column(String(100))
    creado_en = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="agricultor")
    listas_compra = relationship("ListaCompra", back_populates="agricultor")
    pedidos = relationship("Pedido", back_populates="agricultor")
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rut = Column(String(20), unique=True, nullable=False)
    rol = Column(String(20), nullable=False)  # admin, proveedor, agricultor
    telefono = Column(String(20))
    activo = Column(Boolean, default=True)
    creado_en = Column(DateTime, default=datetime.utcnow)

    proveedor = relationship("Proveedor", back_populates="usuario", uselist=False)
    agricultor = relationship("Agricultor", back_populates="usuario", uselist=False)
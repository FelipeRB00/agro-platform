from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Proveedor(Base):
    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    nombre_empresa = Column(String(150), nullable=False)
    direccion = Column(String(255))
    region = Column(String(100))
    descripcion = Column(String)
    porcentaje_comision = Column(Numeric, default=0)
    creado_en = Column(DateTime, default=datetime.utcnow)
    
    banco = Column(String, nullable=True)
    tipo_cuenta = Column(String, nullable=True)
    numero_cuenta = Column(String, nullable=True)
    rut_titular = Column(String, nullable=True)
    nombre_titular = Column(String, nullable=True)

    usuario = relationship("Usuario", back_populates="proveedor")
    catalogo = relationship("CatalogoProveedor", back_populates="proveedor")
    alertas = relationship("Alerta", back_populates="proveedor")
    cotizaciones = relationship("Cotizacion", back_populates="proveedor")
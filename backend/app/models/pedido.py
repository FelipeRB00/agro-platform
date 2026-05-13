from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"))
    cotizacion_id = Column(Integer, ForeignKey("cotizaciones.id"), unique=True)
    estado = Column(String(30), default="pendiente")
    subtotal = Column(Numeric, nullable=False)
    comision_plataforma = Column(Numeric, nullable=False)
    total = Column(Numeric, nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow)

    agricultor = relationship("Agricultor", back_populates="pedidos")
    cotizacion = relationship("Cotizacion", back_populates="pedido")
    detalles = relationship("DetallePedido", back_populates="pedido")
    pagos = relationship("Pago", back_populates="pedido")
    documentos = relationship("DocumentoTributario", back_populates="pedido")


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    insumo_id = Column(Integer, ForeignKey("insumos.id"))
    cantidad = Column(Numeric, nullable=False)
    precio_unitario = Column(Numeric, nullable=False)
    subtotal = Column(Numeric, nullable=False)
    monto_comision = Column(Numeric, default=0)

    pedido = relationship("Pedido", back_populates="detalles")
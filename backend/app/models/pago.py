from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    metodo_pago = Column(String(50))  # transferencia, tarjeta, webpay
    monto = Column(Numeric, nullable=False)
    estado = Column(String(30), default="pendiente")
    referencia_pago = Column(String(255))
    pagado_en = Column(DateTime, nullable=True)

    pedido = relationship("Pedido", back_populates="pagos")


class DocumentoTributario(Base):
    __tablename__ = "documentos_tributarios"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    tipo_documento = Column(String(30))  # boleta, factura, guia_despacho
    folio = Column(String(50))
    rut_emisor = Column(String(20))
    rut_receptor = Column(String(20))
    fecha_emision = Column(DateTime)

    pedido = relationship("Pedido", back_populates="documentos")
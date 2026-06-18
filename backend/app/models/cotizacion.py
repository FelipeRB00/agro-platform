from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Cotizacion(Base):
    __tablename__ = "cotizaciones"

    id = Column(Integer, primary_key=True, index=True)
    lista_id = Column(Integer, ForeignKey("listas_compra.id"))
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    estado = Column(String(30), default="pendiente")  # pendiente, aceptada, rechazada
    nota = Column(String)
    creado_en = Column(DateTime, default=datetime.utcnow)

    lista = relationship("ListaCompra", back_populates="cotizaciones")
    proveedor = relationship("Proveedor", back_populates="cotizaciones")
    items = relationship("ItemCotizacion", back_populates="cotizacion")
    pedido = relationship("Pedido", back_populates="cotizacion", uselist=False)
    acepta_credito = Column(Boolean, default=False)
    dias_credito = Column(Integer, nullable=True)


class ItemCotizacion(Base):
    __tablename__ = "items_cotizacion"

    id = Column(Integer, primary_key=True, index=True)
    cotizacion_id = Column(Integer, ForeignKey("cotizaciones.id"))
    item_lista_id = Column(Integer, ForeignKey("items_lista.id"))
    precio_unitario = Column(Numeric, nullable=False)
    cantidad_ofrecida = Column(Numeric)
    subtotal = Column(Numeric)

    cotizacion = relationship("Cotizacion", back_populates="items")
    item_lista = relationship("ItemLista", back_populates="items_cotizacion")
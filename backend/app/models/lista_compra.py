from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class ListaCompra(Base):
    __tablename__ = "listas_compra"

    id = Column(Integer, primary_key=True, index=True)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"))
    titulo = Column(String(150))
    estado = Column(String(30), default="borrador")  # borrador, publicada, cerrada
    creado_en = Column(DateTime, default=datetime.utcnow)
    cerrado_en = Column(DateTime, nullable=True)

    agricultor = relationship("Agricultor", back_populates="listas_compra")
    items = relationship("ItemLista", back_populates="lista")
    alertas = relationship("Alerta", back_populates="lista")
    cotizaciones = relationship("Cotizacion", back_populates="lista")


class ItemLista(Base):
    __tablename__ = "items_lista"

    id = Column(Integer, primary_key=True, index=True)
    lista_id = Column(Integer, ForeignKey("listas_compra.id"))
    insumo_id = Column(Integer, ForeignKey("insumos.id"))
    cantidad = Column(Numeric, nullable=False)
    unidad_medida = Column(String(30))
    nota = Column(String)

    lista = relationship("ListaCompra", back_populates="items")
    insumo = relationship("Insumo", back_populates="items_lista")
    items_cotizacion = relationship("ItemCotizacion", back_populates="item_lista")
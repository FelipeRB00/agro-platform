from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class Comision(Base):
    __tablename__ = "comisiones"

    id = Column(Integer, primary_key=True, index=True)
    cotizacion_id = Column(Integer, ForeignKey("cotizaciones.id"), nullable=False)
    lista_id = Column(Integer, ForeignKey("listas_compra.id"), nullable=False)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    
    pagado_proveedor = Column(Boolean, default=False)
    fecha_pago_proveedor = Column(DateTime, nullable=True)

    monto_venta = Column(Float, nullable=False)          # subtotal de la venta
    comision_agricultor = Column(Float, nullable=False)  # 0.5% del agricultor
    comision_proveedor = Column(Float, nullable=False)   # 0.5% del proveedor
    comision_total = Column(Float, nullable=False)       # 1% total plataforma

    iva = Column(Float, nullable=False, default=0)       # 19% sobre el monto
    total_con_iva = Column(Float, nullable=False, default=0)

    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    
    metodo_pago = Column(String, default="contado")        # contado / credito
    estado_pago = Column(String, default="pendiente")       # pagado / pendiente
    fecha_vencimiento = Column(DateTime, nullable=True)      # para crédito
    comision_depositada = Column(Boolean, default=False)     # si el proveedor ya pagó su comisión
    fecha_deposito_comision = Column(DateTime, nullable=True)
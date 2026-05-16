import numpy as np
from sqlalchemy.orm import Session
from app.models.catalogo import CatalogoProveedor
from app.models.insumo import Insumo
from app.models.historial import HistorialPrecio

def detectar_alertas_precios(db: Session, umbral_porcentaje: float = 10.0):
    """
    Detecta insumos cuyo precio actual varía significativamente
    respecto a su promedio histórico.
    """
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.activo == True,
        CatalogoProveedor.precio_referencia != None
    ).all()

    alertas = []

    for catalogo in catalogos:
        insumo = db.query(Insumo).filter(Insumo.id == catalogo.insumo_id).first()
        if not insumo:
            continue

        # Obtener historial de precios
        historial = db.query(HistorialPrecio).filter(
            HistorialPrecio.catalogo_id == catalogo.id
        ).order_by(HistorialPrecio.registrado_en.desc()).limit(20).all()

        precio_actual = float(catalogo.precio_referencia)

        if len(historial) < 2:
            continue

        precios_hist = [float(h.precio) for h in historial]
        precio_promedio = np.mean(precios_hist)
        precio_std = np.std(precios_hist)

        variacion = ((precio_actual - precio_promedio) / precio_promedio) * 100

        if abs(variacion) >= umbral_porcentaje:
            from app.models.proveedor import Proveedor
            proveedor = db.query(Proveedor).filter(
                Proveedor.id == catalogo.proveedor_id
            ).first()

            alertas.append({
                "insumo_id": insumo.id,
                "insumo_nombre": insumo.nombre,
                "categoria": insumo.categoria,
                "proveedor_nombre": proveedor.nombre_empresa if proveedor else "Desconocido",
                "precio_actual": round(precio_actual, 2),
                "precio_promedio_historico": round(precio_promedio, 2),
                "variacion_porcentual": round(variacion, 2),
                "tipo_alerta": "alza" if variacion > 0 else "baja",
                "severidad": "alta" if abs(variacion) >= 20 else "media",
                "mensaje": (
                    f"⚠️ El precio de {insumo.nombre} subió un {abs(round(variacion,1))}% sobre su promedio histórico."
                    if variacion > 0
                    else f"✅ El precio de {insumo.nombre} bajó un {abs(round(variacion,1))}% bajo su promedio histórico."
                )
            })

    return sorted(alertas, key=lambda x: abs(x["variacion_porcentual"]), reverse=True)

def obtener_resumen_alertas(db: Session):
    """Resumen rápido para el dashboard"""
    alertas = detectar_alertas_precios(db)
    return {
        "total_alertas": len(alertas),
        "alzas": len([a for a in alertas if a["tipo_alerta"] == "alza"]),
        "bajas": len([a for a in alertas if a["tipo_alerta"] == "baja"]),
        "alta_severidad": len([a for a in alertas if a["severidad"] == "alta"]),
        "alertas": alertas[:5]  # Top 5 más relevantes
    }
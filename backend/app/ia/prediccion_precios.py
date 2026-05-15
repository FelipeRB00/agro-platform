import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sqlalchemy.orm import Session
from app.models.historial import HistorialPrecio
from app.models.catalogo import CatalogoProveedor
from app.models.insumo import Insumo
from datetime import datetime, timedelta

def obtener_datos_precios(db: Session, insumo_id: int = None):
    """Obtiene el historial de precios desde la BD"""
    query = db.query(
        HistorialPrecio,
        CatalogoProveedor,
        Insumo
    ).join(
        CatalogoProveedor, HistorialPrecio.catalogo_id == CatalogoProveedor.id
    ).join(
        Insumo, CatalogoProveedor.insumo_id == Insumo.id
    )

    if insumo_id:
        query = query.filter(CatalogoProveedor.insumo_id == insumo_id)

    registros = query.all()

    datos = []
    for historial, catalogo, insumo in registros:
        datos.append({
            'insumo_id': insumo.id,
            'insumo_nombre': insumo.nombre,
            'categoria': insumo.categoria or 'otro',
            'proveedor_id': catalogo.proveedor_id,
            'precio': float(historial.precio),
            'fecha': historial.registrado_en,
            'mes': historial.registrado_en.month,
            'año': historial.registrado_en.year,
            'dia_año': historial.registrado_en.timetuple().tm_yday
        })

    return pd.DataFrame(datos)

def predecir_precio_simple(db: Session, insumo_id: int, dias_futuro: int = 30):
    """
    Predicción de precio usando regresión lineal sobre historial.
    Si no hay suficientes datos, usa precio promedio del catálogo.
    """
    df = obtener_datos_precios(db, insumo_id)

    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    if not insumo:
        return None

    # Si no hay suficientes datos históricos, usar precio del catálogo
    if len(df) < 3:
        catalogos = db.query(CatalogoProveedor).filter(
            CatalogoProveedor.insumo_id == insumo_id,
            CatalogoProveedor.activo == True
        ).all()

        if not catalogos:
            return {
                "insumo_id": insumo_id,
                "insumo_nombre": insumo.nombre,
                "precio_actual_promedio": None,
                "precio_predicho": None,
                "variacion_porcentual": 0,
                "tendencia": "sin_datos",
                "confianza": "baja",
                "mensaje": "No hay suficientes datos históricos para predecir.",
                "datos_historicos": []
            }

        precios = [float(c.precio_referencia) for c in catalogos if c.precio_referencia]
        precio_promedio = np.mean(precios) if precios else 0

        return {
            "insumo_id": insumo_id,
            "insumo_nombre": insumo.nombre,
            "precio_actual_promedio": round(precio_promedio, 2),
            "precio_predicho": round(precio_promedio, 2),
            "variacion_porcentual": 0,
            "tendencia": "estable",
            "confianza": "baja",
            "mensaje": f"Precio basado en {len(catalogos)} proveedor(es). Se necesitan más datos históricos para predicciones precisas.",
            "datos_historicos": []
        }

    # Preparar datos para regresión
    df = df.sort_values('fecha')
    df['timestamp'] = df['fecha'].apply(lambda x: x.timestamp())

    X = df[['timestamp', 'mes', 'dia_año']].values
    y = df['precio'].values

    # Usar Random Forest si hay suficientes datos, sino Linear Regression
    if len(df) >= 10:
        modelo = RandomForestRegressor(n_estimators=50, random_state=42)
        nombre_modelo = "Random Forest"
        confianza = "alta"
    else:
        modelo = LinearRegression()
        nombre_modelo = "Regresión Lineal"
        confianza = "media"

    modelo.fit(X, y)

    # Predecir precio futuro
    fecha_futura = datetime.now() + timedelta(days=dias_futuro)
    X_futuro = np.array([[
        fecha_futura.timestamp(),
        fecha_futura.month,
        fecha_futura.timetuple().tm_yday
    ]])

    precio_predicho = float(modelo.predict(X_futuro)[0])
    precio_actual = float(df['precio'].iloc[-1])
    variacion = ((precio_predicho - precio_actual) / precio_actual) * 100

    if variacion > 5:
        tendencia = "alza"
    elif variacion < -5:
        tendencia = "baja"
    else:
        tendencia = "estable"

    # Histórico para el gráfico (últimos 10 registros)
    historico = df.tail(10)[['fecha', 'precio']].copy()
    historico['fecha'] = historico['fecha'].apply(lambda x: x.strftime('%d/%m/%Y'))
    historico_lista = historico.to_dict('records')

    return {
        "insumo_id": insumo_id,
        "insumo_nombre": insumo.nombre,
        "precio_actual_promedio": round(precio_actual, 2),
        "precio_predicho": round(max(0, precio_predicho), 2),
        "variacion_porcentual": round(variacion, 2),
        "tendencia": tendencia,
        "confianza": confianza,
        "modelo_usado": nombre_modelo,
        "dias_prediccion": dias_futuro,
        "mensaje": f"Predicción para {dias_futuro} días usando {nombre_modelo}.",
        "datos_historicos": historico_lista
    }

def obtener_resumen_precios(db: Session):
    """Resumen general de precios de todos los insumos activos"""
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.activo == True
    ).all()

    resumen = {}
    for catalogo in catalogos:
        insumo = db.query(Insumo).filter(Insumo.id == catalogo.insumo_id).first()
        if not insumo:
            continue
        if insumo.id not in resumen:
            resumen[insumo.id] = {
                "insumo_id": insumo.id,
                "nombre": insumo.nombre,
                "categoria": insumo.categoria,
                "precios": []
            }
        if catalogo.precio_referencia:
            resumen[insumo.id]["precios"].append(float(catalogo.precio_referencia))

    resultado = []
    for insumo_id, data in resumen.items():
        if data["precios"]:
            resultado.append({
                "insumo_id": insumo_id,
                "nombre": data["nombre"],
                "categoria": data["categoria"],
                "precio_min": round(min(data["precios"]), 2),
                "precio_max": round(max(data["precios"]), 2),
                "precio_promedio": round(np.mean(data["precios"]), 2),
                "num_proveedores": len(data["precios"])
            })

    return sorted(resultado, key=lambda x: x["nombre"])
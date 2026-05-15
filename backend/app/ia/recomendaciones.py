import numpy as np
from sqlalchemy.orm import Session
from app.models.lista_compra import ListaCompra, ItemLista
from app.models.cotizacion import Cotizacion, ItemCotizacion
from app.models.agricultor import Agricultor
from app.models.insumo import Insumo
from app.models.proveedor import Proveedor
from app.models.catalogo import CatalogoProveedor
from collections import Counter

def recomendar_insumos(db: Session, agricultor_id: int, limite: int = 5):
    """
    Recomienda insumos basado en el historial de compras del agricultor
    y los insumos más comprados por agricultores similares.
    """
    # Insumos que ha comprado este agricultor
    listas = db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor_id
    ).all()

    insumos_propios = []
    for lista in listas:
        for item in lista.items:
            insumos_propios.append(item.insumo_id)

    # Insumos más comprados globalmente
    todos_items = db.query(ItemLista).all()
    contador = Counter([item.insumo_id for item in todos_items])

    # Filtrar los que ya compró
    recomendados = []
    for insumo_id, count in contador.most_common(20):
        if insumo_id not in insumos_propios:
            insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
            if insumo:
                # Ver precio promedio
                catalogos = db.query(CatalogoProveedor).filter(
                    CatalogoProveedor.insumo_id == insumo_id,
                    CatalogoProveedor.activo == True
                ).all()
                precio_promedio = np.mean([float(c.precio_referencia) for c in catalogos if c.precio_referencia]) if catalogos else None

                recomendados.append({
                    "insumo_id": insumo_id,
                    "nombre": insumo.nombre,
                    "categoria": insumo.categoria,
                    "popularidad": count,
                    "precio_promedio": round(precio_promedio, 2) if precio_promedio else None,
                    "num_proveedores": len(catalogos),
                    "razon": f"Comprado por {count} agricultor(es) con necesidades similares"
                })

        if len(recomendados) >= limite:
            break

    # Si no hay suficientes recomendaciones, agregar insumos populares
    if len(recomendados) < limite:
        todos_insumos = db.query(Insumo).limit(10).all()
        for insumo in todos_insumos:
            if insumo.id not in insumos_propios and not any(r["insumo_id"] == insumo.id for r in recomendados):
                catalogos = db.query(CatalogoProveedor).filter(
                    CatalogoProveedor.insumo_id == insumo.id,
                    CatalogoProveedor.activo == True
                ).all()
                precio_promedio = np.mean([float(c.precio_referencia) for c in catalogos if c.precio_referencia]) if catalogos else None

                recomendados.append({
                    "insumo_id": insumo.id,
                    "nombre": insumo.nombre,
                    "categoria": insumo.categoria,
                    "popularidad": 0,
                    "precio_promedio": round(precio_promedio, 2) if precio_promedio else None,
                    "num_proveedores": len(catalogos),
                    "razon": "Insumo disponible en la plataforma"
                })

            if len(recomendados) >= limite:
                break

    return recomendados

def recomendar_proveedores(db: Session, insumo_id: int):
    """
    Recomienda los mejores proveedores para un insumo
    basado en precio y disponibilidad.
    """
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.insumo_id == insumo_id,
        CatalogoProveedor.activo == True
    ).all()

    if not catalogos:
        return []

    proveedores = []
    precios = [float(c.precio_referencia) for c in catalogos if c.precio_referencia]
    precio_min = min(precios) if precios else 0
    precio_max = max(precios) if precios else 0

    for catalogo in catalogos:
        proveedor = db.query(Proveedor).filter(
            Proveedor.id == catalogo.proveedor_id
        ).first()
        if not proveedor:
            continue

        precio = float(catalogo.precio_referencia) if catalogo.precio_referencia else 0
        score = 100 - ((precio - precio_min) / (precio_max - precio_min) * 100) if precio_max != precio_min else 100

        proveedores.append({
            "proveedor_id": proveedor.id,
            "nombre_empresa": proveedor.nombre_empresa,
            "region": proveedor.region,
            "precio": round(precio, 2),
            "stock": catalogo.stock_disponible,
            "score": round(score, 1),
            "etiqueta": "Mejor precio" if precio == precio_min else ("Más caro" if precio == precio_max else "Precio competitivo")
        })

    return sorted(proveedores, key=lambda x: x["score"], reverse=True)
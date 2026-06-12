import numpy as np
from sqlalchemy.orm import Session
from app.models.lista_compra import ListaCompra, ItemLista
from app.models.cotizacion import Cotizacion, ItemCotizacion
from app.models.agricultor import Agricultor
from app.models.insumo import Insumo
from app.models.proveedor import Proveedor
from app.models.catalogo import CatalogoProveedor
from collections import Counter


def _insumos_con_proveedor(db: Session):
    """
    Devuelve un set con los insumo_id que tienen al menos un proveedor
    con catálogo activo. Incluye match por insumo_id Y por nombre libre.
    """
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.activo == True
    ).all()

    ids_con_proveedor = set()
    nombres_con_proveedor = set()

    for c in catalogos:
        if c.insumo_id:
            ids_con_proveedor.add(c.insumo_id)
        if c.nombre_libre:
            nombres_con_proveedor.add(c.nombre_libre.lower().strip())

    return ids_con_proveedor, nombres_con_proveedor


def _tiene_proveedor(insumo, ids_con_proveedor, nombres_con_proveedor):
    """Verifica si un insumo tiene proveedor por id o por nombre."""
    if insumo.id in ids_con_proveedor:
        return True
    if insumo.nombre and insumo.nombre.lower().strip() in nombres_con_proveedor:
        return True
    return False


def _contar_proveedores(db: Session, insumo):
    """Cuenta proveedores activos para un insumo (por id o nombre) y su precio promedio."""
    catalogos = db.query(CatalogoProveedor).filter(
        CatalogoProveedor.activo == True
    ).all()

    precios = []
    num = 0
    for c in catalogos:
        coincide = False
        if c.insumo_id and c.insumo_id == insumo.id:
            coincide = True
        elif c.nombre_libre and c.nombre_libre.lower().strip() == insumo.nombre.lower().strip():
            coincide = True

        if coincide:
            num += 1
            if c.precio_referencia:
                precios.append(float(c.precio_referencia))

    precio_promedio = round(np.mean(precios), 2) if precios else None
    return num, precio_promedio


def recomendar_insumos(db: Session, agricultor_id: int, limite: int = 5):
    """
    Recomienda insumos basado en el historial del agricultor y la popularidad
    global, PERO solo insumos que al menos un proveedor ofrece activamente.
    """
    # Insumos que ya compró este agricultor
    listas = db.query(ListaCompra).filter(
        ListaCompra.agricultor_id == agricultor_id
    ).all()

    insumos_propios = set()
    for lista in listas:
        for item in lista.items:
            insumos_propios.add(item.insumo_id)

    # Conjuntos de insumos que SÍ tienen proveedor
    ids_con_proveedor, nombres_con_proveedor = _insumos_con_proveedor(db)

    # Popularidad global (qué piden todos los agricultores)
    todos_items = db.query(ItemLista).all()
    contador = Counter([item.insumo_id for item in todos_items])

    recomendados = []

    # 1. Recomendar por popularidad, solo insumos con proveedor y no comprados
    for insumo_id, count in contador.most_common(50):
        if len(recomendados) >= limite:
            break
        if insumo_id in insumos_propios:
            continue

        insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
        if not insumo:
            continue
        if not _tiene_proveedor(insumo, ids_con_proveedor, nombres_con_proveedor):
            continue  # ← clave: saltar insumos sin proveedor

        num_prov, precio_prom = _contar_proveedores(db, insumo)
        recomendados.append({
            "insumo_id": insumo.id,
            "nombre": insumo.nombre,
            "categoria": insumo.categoria,
            "popularidad": count,
            "precio_promedio": precio_prom,
            "num_proveedores": num_prov,
            "razon": f"Comprado por {count} agricultor(es) con necesidades similares"
        })

    # 2. Completar con insumos que tienen proveedor (aunque no sean populares aún)
    if len(recomendados) < limite:
        todos_insumos = db.query(Insumo).all()
        ya_recomendados = {r["insumo_id"] for r in recomendados}

        for insumo in todos_insumos:
            if len(recomendados) >= limite:
                break
            if insumo.id in insumos_propios or insumo.id in ya_recomendados:
                continue
            if not _tiene_proveedor(insumo, ids_con_proveedor, nombres_con_proveedor):
                continue  # ← solo insumos con proveedor

            num_prov, precio_prom = _contar_proveedores(db, insumo)
            recomendados.append({
                "insumo_id": insumo.id,
                "nombre": insumo.nombre,
                "categoria": insumo.categoria,
                "popularidad": 0,
                "precio_promedio": precio_prom,
                "num_proveedores": num_prov,
                "razon": "Disponible con proveedores activos en la plataforma"
            })

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
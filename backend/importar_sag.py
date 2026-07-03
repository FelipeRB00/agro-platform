"""
Script de importación del catálogo SAG a la base de datos de RAILWAY (producción).

USO:
1. Copia la DATABASE_PUBLIC_URL desde Railway (servicio Postgres -> Variables).
2. Pégala abajo en la variable DATABASE_URL_RAILWAY.
3. Asegúrate de tener el Excel del SAG en la misma carpeta.
4. Ejecuta: python importar_sag_railway.py

IMPORTANTE: Este script escribe en la base de datos de PRODUCCIÓN (Railway).
"""

import openpyxl
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

# ─────────────────────────────────────────────────────────────
# PEGA AQUÍ la DATABASE_PUBLIC_URL de Railway (entre las comillas)
# ─────────────────────────────────────────────────────────────
DATABASE_URL_RAILWAY = "postgresql://postgres:bCZhbwhQtGoocmGvzhuypwPAUXjiVKod@hayabusa.proxy.rlwy.net:19334/railway"


# Corregir postgres:// -> postgresql:// si es necesario
if DATABASE_URL_RAILWAY.startswith("postgres://"):
    DATABASE_URL_RAILWAY = DATABASE_URL_RAILWAY.replace("postgres://", "postgresql://", 1)

ARCHIVO_EXCEL = "Plaguicidas Autorizados - resumen al 01-10-2025.xlsx"

# ─────────────────────────────────────────────────────────────
# Definición mínima del modelo Insumo (para no depender del proyecto)
# ─────────────────────────────────────────────────────────────
Base = declarative_base()

class Insumo(Base):
    __tablename__ = "insumos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String)
    categoria = Column(String(100))
    unidad_medida = Column(String(30))
    creado_en = Column(DateTime, default=datetime.utcnow)
    ingrediente_activo = Column(String, nullable=True)


def limpiar(valor):
    if valor is None:
        return ""
    return str(valor).strip()


def mapear_categoria(aptitud):
    if not aptitud:
        return "plaguicida"
    a = str(aptitud).lower()
    if "herbicida" in a:
        return "herbicida"
    if "fungicida" in a:
        return "fungicida"
    if "insecticida" in a or "acaricida" in a or "nematicida" in a:
        return "insecticida"
    return "plaguicida"


def importar():
    print("Conectando a la base de datos de Railway...")
    engine = create_engine(DATABASE_URL_RAILWAY)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    print("Abriendo planilla del SAG...")
    wb = openpyxl.load_workbook(ARCHIVO_EXCEL, read_only=True)
    ws = wb["data"]

    existentes = {i.nombre.lower() for i in db.query(Insumo).all()}
    print(f"Insumos ya existentes en la BD remota: {len(existentes)}")

    nuevos = 0
    omitidos = 0

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue

        nombre = limpiar(row[1])
        aptitud = row[2]
        sustancia = limpiar(row[3])
        concentracion = limpiar(row[4])
        formulacion = limpiar(row[5])

        if not nombre:
            continue
        if nombre.lower() in existentes:
            omitidos += 1
            continue

        categoria = mapear_categoria(aptitud)
        ingrediente = sustancia
        if concentracion:
            ingrediente = f"{sustancia} {concentracion}"
        descripcion = f"{aptitud}"
        if formulacion:
            descripcion += f" · {formulacion}"

        insumo = Insumo(
            nombre=nombre,
            descripcion=descripcion,
            categoria=categoria,
            unidad_medida="litro",
            ingrediente_activo=ingrediente if ingrediente else None
        )
        db.add(insumo)
        existentes.add(nombre.lower())
        nuevos += 1

        if nuevos % 200 == 0:
            db.commit()
            print(f"  {nuevos} insumos importados...")

    db.commit()
    db.close()

    print(f"\n✅ Importación completada en Railway")
    print(f"   Nuevos insumos: {nuevos}")
    print(f"   Omitidos (duplicados): {omitidos}")


if __name__ == "__main__":
    if "PEGA_AQUI" in DATABASE_URL_RAILWAY:
        print("❌ ERROR: Primero pega la DATABASE_PUBLIC_URL de Railway en el script.")
    else:
        importar()
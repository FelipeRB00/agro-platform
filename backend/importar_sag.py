"""
Script de importación de plaguicidas del registro oficial del SAG
(Servicio Agrícola y Ganadero de Chile) a la tabla de insumos de CultivaTech.

Fuente: Planilla "Plaguicidas Autorizados" del SAG.
Uso:
    1. Coloca el archivo Excel del SAG en la misma carpeta que este script
       (o ajusta la variable ARCHIVO_EXCEL con la ruta).
    2. Activa el entorno virtual del backend.
    3. Ejecuta: python importar_sag.py
"""

import openpyxl
from app.db.database import SessionLocal

# Importar TODOS los modelos para que SQLAlchemy resuelva las relaciones
from app.models import usuario, proveedor, agricultor, insumo, catalogo
from app.models import lista_compra, cotizacion, pedido, pago, historial, alerta, comision
from app.models.insumo import Insumo

# Ruta al archivo Excel del SAG (ajusta si es necesario)
ARCHIVO_EXCEL = "Plaguicidas Autorizados - resumen al 01-10-2025.xlsx"

def limpiar(valor):
    """Convierte cualquier valor a string limpio."""
    if valor is None:
        return ""
    return str(valor).strip()


def mapear_categoria(aptitud):
    """Mapea la aptitud del SAG a las categorías de CultivaTech."""
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
    print("Abriendo planilla del SAG...")
    wb = openpyxl.load_workbook(ARCHIVO_EXCEL, read_only=True)
    ws = wb["data"]

    db = SessionLocal()

    # Obtener nombres ya existentes para evitar duplicados
    existentes = {i.nombre.lower() for i in db.query(Insumo).all()}
    print(f"Insumos ya existentes en la BD: {len(existentes)}")

    nuevos = 0
    omitidos = 0

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:  # saltar encabezado
            continue

        nombre = limpiar(row[1])           # NOMBRE COMERCIAL
        aptitud = row[2]                   # APTITUD
        sustancia = limpiar(row[3])        # SUSTANCIAS ACTIVAS
        concentracion = limpiar(row[4])    # CONCENTRACIÓN
        formulacion = limpiar(row[5])      # FORMULACIÓN

        if not nombre:
            continue

        # Evitar duplicados por nombre
        if nombre.lower() in existentes:
            omitidos += 1
            continue

        categoria = mapear_categoria(aptitud)

        # Ingrediente activo = sustancia + concentración
        ingrediente = sustancia
        if concentracion:
            ingrediente = f"{sustancia} {concentracion}"

        # Descripción con la formulación
        descripcion = f"{aptitud}"
        if formulacion:
            descripcion += f" · {formulacion}"

        insumo = Insumo(
            nombre=nombre,
            descripcion=descripcion,
            categoria=categoria,
            unidad_medida="litro",  # valor por defecto, ajustable luego
            ingrediente_activo=ingrediente if ingrediente else None
        )
        db.add(insumo)
        existentes.add(nombre.lower())
        nuevos += 1

        # Commit por lotes para no saturar memoria
        if nuevos % 200 == 0:
            db.commit()
            print(f"  {nuevos} insumos importados...")

    db.commit()
    db.close()

    print(f"\n✅ Importación completada")
    print(f"   Nuevos insumos: {nuevos}")
    print(f"   Omitidos (duplicados): {omitidos}")


if __name__ == "__main__":
    importar()

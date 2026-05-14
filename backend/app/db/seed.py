from app.db.database import SessionLocal
from app.models.insumo import Insumo

def seed_insumos():
    db = SessionLocal()
    if db.query(Insumo).count() > 0:
        db.close()
        return

    insumos = [
        Insumo(nombre="Urea 46%", descripcion="Fertilizante nitrogenado granulado", categoria="fertilizante", unidad_medida="kg"),
        Insumo(nombre="Fosfato Diamónico (DAP)", descripcion="Fertilizante fosfatado", categoria="fertilizante", unidad_medida="kg"),
        Insumo(nombre="Nitrato de Potasio", descripcion="Fertilizante potásico", categoria="fertilizante", unidad_medida="kg"),
        Insumo(nombre="Fertilizante NPK 15-15-15", descripcion="Fertilizante completo balanceado", categoria="fertilizante", unidad_medida="kg"),
        Insumo(nombre="Semillas de Maíz Dekalb", descripcion="Semilla híbrida de alta producción", categoria="semilla", unidad_medida="saco"),
        Insumo(nombre="Semillas de Trigo", descripcion="Variedad de ciclo corto", categoria="semilla", unidad_medida="saco"),
        Insumo(nombre="Semillas de Soja", descripcion="Alta resistencia a sequía", categoria="semilla", unidad_medida="saco"),
        Insumo(nombre="Glifosato 48%", descripcion="Herbicida sistémico", categoria="plaguicida", unidad_medida="litro"),
        Insumo(nombre="Clorpirifos", descripcion="Insecticida organofosforado", categoria="plaguicida", unidad_medida="litro"),
        Insumo(nombre="Mancozeb 80%", descripcion="Fungicida preventivo", categoria="plaguicida", unidad_medida="kg"),
    ]

    db.add_all(insumos)
    db.commit()
    db.close()
    print("✅ Insumos sembrados correctamente")
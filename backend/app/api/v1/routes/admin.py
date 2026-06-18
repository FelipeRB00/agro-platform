from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor
from app.models.agricultor import Agricultor
from app.schemas.admin import UsuarioAdminResponse, UsuarioUpdateAdmin
from app.core.dependencies import require_rol
from app.models.comision import Comision
from sqlalchemy import func, extract
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Administración"])

@router.get("/stats")
def obtener_stats(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    total_usuarios = db.query(Usuario).count()
    total_proveedores = db.query(Usuario).filter(Usuario.rol == "proveedor").count()
    total_agricultores = db.query(Usuario).filter(Usuario.rol == "agricultor").count()
    usuarios_activos = db.query(Usuario).filter(Usuario.activo == True).count()

    return {
        "total_usuarios": total_usuarios,
        "total_proveedores": total_proveedores,
        "total_agricultores": total_agricultores,
        "usuarios_activos": usuarios_activos,
    }

@router.get("/usuarios", response_model=List[UsuarioAdminResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    return db.query(Usuario).order_by(Usuario.creado_en.desc()).all()

@router.put("/usuarios/{usuario_id}")
def actualizar_usuario(
    usuario_id: int,
    data: UsuarioUpdateAdmin,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes modificarte a ti mismo")

    if data.activo is not None:
        usuario.activo = data.activo
    if data.rol is not None:
        usuario.rol = data.rol

    db.commit()
    db.refresh(usuario)
    return {"message": "Usuario actualizado", "usuario": usuario.nombre}

@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado"}

@router.get("/ingresos/resumen")
def resumen_ingresos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    comisiones = db.query(Comision).all()

    total_comisiones = sum(float(c.comision_total or 0) for c in comisiones)
    total_ventas = sum(float(c.monto_venta or 0) for c in comisiones)
    total_iva = sum(float(c.iva or 0) for c in comisiones)
    num_ventas = len(comisiones)

    # Mes actual
    ahora = datetime.now()
    comisiones_mes = [
        c for c in comisiones
        if c.creado_en and c.creado_en.month == ahora.month
        and c.creado_en.year == ahora.year
    ]
    ingresos_mes = sum(float(c.comision_total or 0) for c in comisiones_mes)

    return {
        "total_comisiones": total_comisiones,
        "total_ventas": total_ventas,
        "total_iva": total_iva,
        "num_ventas": num_ventas,
        "ingresos_mes_actual": ingresos_mes,
        "ventas_mes_actual": len(comisiones_mes)
    }


@router.get("/ingresos/por-mes")
def ingresos_por_mes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    comisiones = db.query(Comision).all()

    meses_nombres = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ]

    # Agrupar por mes del año actual
    ahora = datetime.now()
    datos = {}
    for mes in range(1, 13):
        datos[mes] = {"comisiones": 0, "ventas": 0, "monto": 0}

    for c in comisiones:
        if c.creado_en and c.creado_en.year == ahora.year:
            mes = c.creado_en.month
            datos[mes]["comisiones"] += float(c.comision_total or 0)
            datos[mes]["ventas"] += 1
            datos[mes]["monto"] += float(c.monto_venta or 0)

    resultado = []
    for mes in range(1, 13):
        resultado.append({
            "mes": meses_nombres[mes - 1],
            "mes_num": mes,
            "comisiones": round(datos[mes]["comisiones"], 0),
            "ventas": datos[mes]["ventas"],
            "monto_total": round(datos[mes]["monto"], 0)
        })

    return resultado


@router.get("/ingresos/detalle")
def detalle_ingresos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    comisiones = db.query(Comision).order_by(Comision.creado_en.desc()).limit(50).all()

    resultado = []
    for c in comisiones:
        from app.models.agricultor import Agricultor
        from app.models.proveedor import Proveedor

        agricultor = db.query(Agricultor).filter(Agricultor.id == c.agricultor_id).first()
        proveedor = db.query(Proveedor).filter(Proveedor.id == c.proveedor_id).first()

        usuario_agr = agricultor.usuario if agricultor else None

        resultado.append({
            "id": c.id,
            "fecha": c.creado_en,
            "agricultor": usuario_agr.nombre if usuario_agr else "Desconocido",
            "proveedor": proveedor.nombre_empresa if proveedor else "Desconocido",
            "monto_venta": float(c.monto_venta or 0),
            "comision_total": float(c.comision_total or 0)
        })

    return resultado

# ═══════════════════════════════════════════════════════════════════
# NUEVOS ENDPOINTS: COMISIONES POR COBRAR (modelo pago directo)
# Agregar estos endpoints al final de admin.py
# ═══════════════════════════════════════════════════════════════════

@router.get("/comisiones/resumen-proveedores")
def comisiones_resumen_proveedores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    """
    Resumen agrupado por proveedor: cuánto debe depositar cada uno
    en comisiones a la plataforma (modelo pago directo).
    """
    comisiones = db.query(Comision).all()

    # Agrupar por proveedor
    agrupado = {}
    for c in comisiones:
        prov_id = c.proveedor_id
        if prov_id not in agrupado:
            proveedor = db.query(Proveedor).filter(Proveedor.id == prov_id).first()
            agrupado[prov_id] = {
                "proveedor_id": prov_id,
                "proveedor": proveedor.nombre_empresa if proveedor else "Desconocido",
                "total_ventas": 0,
                "comision_adeudada": 0,      # comisiones pendientes de depositar
                "comision_depositada": 0,    # ya depositadas
                "num_ventas": 0,
                "num_pendientes": 0,
            }

        monto_venta = float(c.monto_venta or 0)
        comision_total = float(c.comision_total or 0)

        agrupado[prov_id]["total_ventas"] += monto_venta
        agrupado[prov_id]["num_ventas"] += 1

        if c.comision_depositada:
            agrupado[prov_id]["comision_depositada"] += comision_total
        else:
            agrupado[prov_id]["comision_adeudada"] += comision_total
            agrupado[prov_id]["num_pendientes"] += 1

    # Redondear y convertir a lista
    resultado = []
    for prov in agrupado.values():
        prov["total_ventas"] = round(prov["total_ventas"], 0)
        prov["comision_adeudada"] = round(prov["comision_adeudada"], 0)
        prov["comision_depositada"] = round(prov["comision_depositada"], 0)
        resultado.append(prov)

    # Ordenar por comisión adeudada (mayor primero)
    resultado.sort(key=lambda x: x["comision_adeudada"], reverse=True)
    return resultado


@router.get("/comisiones/detalle")
def comisiones_detalle(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    """
    Detalle de cada transacción con su comisión (modelo pago directo).
    Muestra método de pago, estado y si la comisión fue depositada.
    """
    comisiones = db.query(Comision).order_by(Comision.creado_en.desc()).all()

    resultado = []
    for c in comisiones:
        agricultor = db.query(Agricultor).filter(Agricultor.id == c.agricultor_id).first()
        proveedor = db.query(Proveedor).filter(Proveedor.id == c.proveedor_id).first()
        usuario_agr = agricultor.usuario if agricultor else None

        resultado.append({
            "comision_id": c.id,
            "fecha": c.creado_en,
            "agricultor": usuario_agr.nombre if usuario_agr else "Desconocido",
            "proveedor": proveedor.nombre_empresa if proveedor else "Desconocido",
            "monto_venta": float(c.monto_venta or 0),
            "comision_agricultor": float(c.comision_agricultor or 0),
            "comision_proveedor": float(c.comision_proveedor or 0),
            "comision_total": float(c.comision_total or 0),
            "metodo_pago": c.metodo_pago or "contado",
            "estado_pago": c.estado_pago or "pendiente",
            "fecha_vencimiento": c.fecha_vencimiento,
            "comision_depositada": bool(c.comision_depositada),
            "fecha_deposito_comision": c.fecha_deposito_comision,
        })

    return resultado


@router.put("/comisiones/{comision_id}/marcar-depositada")
def marcar_comision_depositada(
    comision_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    """
    Marca la comisión de una transacción como depositada por el proveedor.
    """
    comision = db.query(Comision).filter(Comision.id == comision_id).first()
    if not comision:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")

    comision.comision_depositada = True
    comision.fecha_deposito_comision = datetime.now()
    db.commit()
    return {"message": "Comisión marcada como depositada"}


@router.put("/comisiones/proveedor/{proveedor_id}/marcar-todas-depositadas")
def marcar_todas_comisiones_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("admin"))
):
    """
    Marca TODAS las comisiones pendientes de un proveedor como depositadas
    (útil para liquidación mensual completa).
    """
    comisiones = db.query(Comision).filter(
        Comision.proveedor_id == proveedor_id,
        Comision.comision_depositada == False
    ).all()

    if not comisiones:
        raise HTTPException(status_code=404, detail="No hay comisiones pendientes para este proveedor")

    for c in comisiones:
        c.comision_depositada = True
        c.fecha_deposito_comision = datetime.now()

    db.commit()
    return {"message": f"{len(comisiones)} comisiones marcadas como depositadas"}
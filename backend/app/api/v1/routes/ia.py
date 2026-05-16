from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.usuario import Usuario
from app.models.agricultor import Agricultor
from app.models.insumo import Insumo
from app.ia.prediccion_precios import predecir_precio_simple, obtener_resumen_precios
from app.ia.recomendaciones import recomendar_insumos, recomendar_proveedores
from typing import List

router = APIRouter(prefix="/ia", tags=["Inteligencia Artificial"])

@router.get("/prediccion/{insumo_id}")
def predecir_precio(
    insumo_id: int,
    dias: int = Query(default=30, ge=7, le=180),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return predecir_precio_simple(db, insumo_id, dias)

@router.get("/resumen-precios")
def resumen_precios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_resumen_precios(db)

@router.get("/recomendaciones")
def mis_recomendaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    agricultor = db.query(Agricultor).filter(
        Agricultor.usuario_id == current_user.id
    ).first()
    if not agricultor:
        return []
    return recomendar_insumos(db, agricultor.id)

@router.get("/proveedores/{insumo_id}")
def mejores_proveedores(
    insumo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return recomendar_proveedores(db, insumo_id)

from app.ia.alertas_precios import detectar_alertas_precios, obtener_resumen_alertas

@router.get("/alertas-precios")
def alertas_precios(
    umbral: float = Query(default=10.0, ge=1.0, le=50.0),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return detectar_alertas_precios(db, umbral)

@router.get("/alertas-precios/resumen")
def resumen_alertas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_resumen_alertas(db)
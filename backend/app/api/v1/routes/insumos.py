from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.insumo import Insumo
from app.schemas.insumo import InsumoResponse
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/insumos", tags=["Insumos"])

@router.get("/", response_model=List[InsumoResponse])
def listar_insumos(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Insumo).all()
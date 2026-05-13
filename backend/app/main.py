from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.models import (usuario, proveedor, agricultor, 
                        insumo, catalogo, lista_compra, 
                        cotizacion, pedido, pago, historial, alerta)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agro Platform API",
    description="Plataforma Web Inteligente para Optimización de Compra de Insumos Agrícolas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Agro Platform API funcionando ✅"}
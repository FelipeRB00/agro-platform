from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.models import (usuario, proveedor, agricultor,
                        insumo, catalogo, lista_compra,
                        cotizacion, pedido, pago, historial, alerta)
from app.api.v1.routes import auth, insumos, listas
from app.db.seed import seed_insumos


Base.metadata.create_all(bind=engine)

seed_insumos()

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

app.include_router(auth.router, prefix="/api/v1")
app.include_router(insumos.router, prefix="/api/v1")
app.include_router(listas.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Agro Platform API funcionando ✅"}
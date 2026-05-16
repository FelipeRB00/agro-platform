from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.db.database import Base, engine
from app.models import (usuario, proveedor, agricultor,
                        insumo, catalogo, lista_compra,
                        cotizacion, pedido, pago, historial, alerta)
from app.api.v1.routes import auth, insumos, listas, catalogo as catalogo_routes, cotizaciones, admin, ia
from app.db.seed import seed_insumos

# Crear tablas
Base.metadata.create_all(bind=engine)

# Seedear insumos
seed_insumos()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CultivaTech API",
    description="Plataforma Web Inteligente para Optimización de Compra de Insumos Agrícolas",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador global de errores no controlados
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor. Por favor intenta nuevamente."}
    )

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(insumos.router, prefix="/api/v1")
app.include_router(listas.router, prefix="/api/v1")
app.include_router(catalogo_routes.router, prefix="/api/v1")
app.include_router(cotizaciones.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(ia.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "CultivaTech API funcionando ✅",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
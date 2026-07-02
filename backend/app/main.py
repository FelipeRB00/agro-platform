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
from app.api.v1.routes import auth, insumos, listas, catalogo as catalogo_routes, cotizaciones, admin, ia, perfil, reportes, ws
from app.db.seed import seed_insumos
from app.models.comision import Comision
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
import os


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

# Crear carpeta de uploads si no existe
os.makedirs("uploads/productos", exist_ok=True)

# Servir archivos estáticos (después de crear app = FastAPI())
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS - lee los orígenes permitidos desde la configuración (variable FRONTEND_URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origenes_cors,
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
app.include_router(perfil.router, prefix="/api/v1")
app.include_router(reportes.router, prefix="/api/v1")
app.include_router(ws.router)


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
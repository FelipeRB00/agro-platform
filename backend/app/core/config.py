from dotenv import load_dotenv
import os

load_dotenv()


def _normalizar_db_url(url: str) -> str:
    """
    Railway (y algunos proveedores) entregan la URL como 'postgres://'
    pero SQLAlchemy requiere 'postgresql://'. Esta función lo corrige.
    """
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Settings:
    PROJECT_NAME: str = "Agro Platform"
    DATABASE_URL: str = _normalizar_db_url(
        os.getenv("DATABASE_URL", "postgresql://user:password@localhost/agrodb")
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cambia-esta-clave-en-produccion")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 día
    COMISION_PORCENTAJE: float = 0.03  # 3% que paga el proveedor
    IVA_PORCENTAJE: float = 0.19
    # MercadoPago (ya no se usa, se mantiene por compatibilidad)
    MERCADOPAGO_ACCESS_TOKEN: str = os.getenv("MERCADOPAGO_ACCESS_TOKEN", "")
    # URL(s) del frontend permitidas para CORS.
    # Acepta varias separadas por coma. Ej: "https://miapp.vercel.app,http://localhost:5173"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173,http://127.0.0.1:5173")

    @property
    def origenes_cors(self) -> list:
        """Devuelve la lista de orígenes permitidos para CORS."""
        return [o.strip() for o in self.FRONTEND_URL.split(",") if o.strip()]


settings = Settings()
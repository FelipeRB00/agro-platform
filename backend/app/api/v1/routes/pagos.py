from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import mercadopago

from app.db.database import get_db
from app.core.dependencies import require_rol
from app.core.config import settings
from app.models.usuario import Usuario
from app.models.cotizacion import Cotizacion
from app.models.lista_compra import ListaCompra, ItemLista
from app.models.proveedor import Proveedor
from app.models.insumo import Insumo
from app.models.agricultor import Agricultor

router = APIRouter(prefix="/pagos", tags=["Pagos MercadoPago"])


@router.post("/crear-preferencia/{cotizacion_id}")
def crear_preferencia(
    cotizacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rol("agricultor"))
):
    agricultor = db.query(Agricultor).filter(
        Agricultor.usuario_id == current_user.id
    ).first()

    cotizacion = db.query(Cotizacion).filter(Cotizacion.id == cotizacion_id).first()
    if not cotizacion:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

    lista = db.query(ListaCompra).filter(
        ListaCompra.id == cotizacion.lista_id,
        ListaCompra.agricultor_id == agricultor.id
    ).first()
    if not lista:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Calcular total con comisión + IVA
    subtotal = sum(float(i.subtotal or 0) for i in cotizacion.items)
    comision = round(subtotal * 0.005, 0)
    iva = round(subtotal * 0.19, 0)
    total = subtotal + iva + comision

    proveedor = db.query(Proveedor).filter(Proveedor.id == cotizacion.proveedor_id).first()

    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

    preference_data = {
        "items": [
            {
                "title": f"Compra CultivaTech - {lista.titulo}",
                "description": f"Proveedor: {proveedor.nombre_empresa if proveedor else 'N/A'}",
                "quantity": 1,
                "currency_id": "CLP",
                "unit_price": float(total)
            }
        ],
        "back_urls": {
            "success": f"{settings.FRONTEND_URL}/pago-resultado?status=success&cotizacion={cotizacion_id}",
            "failure": f"{settings.FRONTEND_URL}/pago-resultado?status=failure&cotizacion={cotizacion_id}",
            "pending": f"{settings.FRONTEND_URL}/pago-resultado?status=pending&cotizacion={cotizacion_id}"
        },
        "external_reference": str(cotizacion_id)
    }

    result = sdk.preference().create(preference_data)

    if result["status"] != 201:
        # Mostrar el error real de MercadoPago para diagnóstico
        print("ERROR MERCADOPAGO:", result)
        raise HTTPException(
            status_code=500,
            detail=f"Error MP: {result.get('response', {})}"
        )

    return {
        "preference_id": result["response"]["id"],
        "init_point": result["response"]["init_point"],
        "total": total
    }
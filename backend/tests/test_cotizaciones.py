import pytest
from tests.conftest import auth_headers, TestingSessionLocal

def get_insumo_id():
    from app.models.insumo import Insumo
    db = TestingSessionLocal()
    insumo = db.query(Insumo).first()
    db.close()
    return insumo.id

def test_cotizacion_flujo_completo(client, agricultor_token, proveedor_token):
    insumo_id = get_insumo_id()

    # 1. Agricultor crea y publica lista
    res = client.post("/api/v1/listas/", json={
        "titulo": "Lista cotizacion test",
        "estado": "borrador",
        "items": [{"insumo_id": insumo_id, "cantidad": 200, "unidad_medida": "kg"}]
    }, headers=auth_headers(agricultor_token))
    assert res.status_code == 200
    lista_id = res.json()["id"]

    client.post(f"/api/v1/listas/{lista_id}/publicar",
        headers=auth_headers(agricultor_token))

    # 2. Obtener items de la lista
    res_lista = client.get(f"/api/v1/listas/{lista_id}",
        headers=auth_headers(agricultor_token))
    item_id = res_lista.json()["items"][0]["id"]

    # 3. Proveedor cotiza
    res_cot = client.post("/api/v1/cotizaciones/", json={
        "lista_id": lista_id,
        "nota": "Precio incluye flete",
        "items": [{
            "item_lista_id": item_id,
            "precio_unitario": 450.0,
            "cantidad_ofrecida": 200.0
        }]
    }, headers=auth_headers(proveedor_token))
    assert res_cot.status_code == 200
    cotizacion_id = res_cot.json()["id"]

    # 4. Agricultor ve cotizaciones
    res_ver = client.get(f"/api/v1/cotizaciones/por-lista/{lista_id}",
        headers=auth_headers(agricultor_token))
    assert res_ver.status_code == 200
    assert len(res_ver.json()) >= 1

    # 5. Agricultor acepta
    res_acepta = client.put(f"/api/v1/cotizaciones/{cotizacion_id}/aceptar",
        headers=auth_headers(agricultor_token))
    assert res_acepta.status_code == 200

def test_cotizacion_precio_invalido(client, proveedor_token):
    res = client.post("/api/v1/cotizaciones/", json={
        "lista_id": 9999,
        "items": [{"item_lista_id": 1, "precio_unitario": 0, "cantidad_ofrecida": 10}]
    }, headers=auth_headers(proveedor_token))
    assert res.status_code in [400, 404]

def test_cotizacion_items_vacios(client, proveedor_token):
    res = client.post("/api/v1/cotizaciones/", json={
        "lista_id": 9999,
        "items": []
    }, headers=auth_headers(proveedor_token))
    assert res.status_code in [400, 404]

def test_catalogo_crud(client, proveedor_token):
    insumo_id = get_insumo_id()

    # Crear
    res = client.post("/api/v1/catalogo/", json={
        "insumo_id": insumo_id,
        "precio_referencia": 500.0,
        "stock_disponible": 1000
    }, headers=auth_headers(proveedor_token))
    assert res.status_code == 200
    catalogo_id = res.json()["id"]

    # Actualizar
    res_put = client.put(f"/api/v1/catalogo/{catalogo_id}", json={
        "precio_referencia": 550.0
    }, headers=auth_headers(proveedor_token))
    assert res_put.status_code == 200
    assert res_put.json()["precio_referencia"] == 550.0

    # Eliminar
    res_del = client.delete(f"/api/v1/catalogo/{catalogo_id}",
        headers=auth_headers(proveedor_token))
    assert res_del.status_code == 200
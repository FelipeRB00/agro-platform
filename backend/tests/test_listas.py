import pytest
from tests.conftest import auth_headers, TestingSessionLocal

def get_insumo_id():
    from app.models.insumo import Insumo
    db = TestingSessionLocal()
    insumo = db.query(Insumo).first()
    db.close()
    return insumo.id

def test_crear_lista(client, agricultor_token):
    insumo_id = get_insumo_id()
    res = client.post("/api/v1/listas/", json={
        "titulo": "Lista de prueba",
        "estado": "borrador",
        "items": [{"insumo_id": insumo_id, "cantidad": 100, "unidad_medida": "kg"}]
    }, headers=auth_headers(agricultor_token))
    assert res.status_code == 200
    assert res.json()["titulo"] == "Lista de prueba"
    assert res.json()["estado"] == "borrador"

def test_crear_lista_sin_items(client, agricultor_token):
    res = client.post("/api/v1/listas/", json={
        "titulo": "Lista vacía",
        "estado": "borrador",
        "items": []
    }, headers=auth_headers(agricultor_token))
    assert res.status_code == 400

def test_crear_lista_titulo_vacio(client, agricultor_token):
    insumo_id = get_insumo_id()
    res = client.post("/api/v1/listas/", json={
        "titulo": "",
        "estado": "borrador",
        "items": [{"insumo_id": insumo_id, "cantidad": 10, "unidad_medida": "kg"}]
    }, headers=auth_headers(agricultor_token))
    assert res.status_code == 400

def test_listar_mis_listas(client, agricultor_token):
    res = client.get("/api/v1/listas/",
        headers=auth_headers(agricultor_token))
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_publicar_lista(client, agricultor_token):
    insumo_id = get_insumo_id()
    res_crear = client.post("/api/v1/listas/", json={
        "titulo": "Lista para publicar",
        "estado": "borrador",
        "items": [{"insumo_id": insumo_id, "cantidad": 50, "unidad_medida": "kg"}]
    }, headers=auth_headers(agricultor_token))
    assert res_crear.status_code == 200
    lista_id = res_crear.json()["id"]

    res_publicar = client.post(f"/api/v1/listas/{lista_id}/publicar",
        headers=auth_headers(agricultor_token))
    assert res_publicar.status_code == 200
    assert res_publicar.json()["estado"] == "publicada"

def test_eliminar_lista_publicada_falla(client, agricultor_token):
    res = client.get("/api/v1/listas/", headers=auth_headers(agricultor_token))
    publicadas = [l for l in res.json() if l["estado"] == "publicada"]
    if publicadas:
        res_del = client.delete(f"/api/v1/listas/{publicadas[0]['id']}",
            headers=auth_headers(agricultor_token))
        assert res_del.status_code == 400
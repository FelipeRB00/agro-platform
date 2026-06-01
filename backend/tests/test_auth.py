import pytest
from tests.conftest import auth_headers

def test_register_agricultor(client):
    res = client.post("/api/v1/auth/register", json={
        "nombre": "Nuevo Agricultor",
        "email": "nuevo@test.cl",
        "rut": "44.444.444-4",
        "password": "test1234",
        "rol": "agricultor"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "nuevo@test.cl"
    assert res.json()["rol"] == "agricultor"

def test_register_email_duplicado(client, agricultor_token):
    # agricultor_token ya registró agricultor@test.cl
    res = client.post("/api/v1/auth/register", json={
        "nombre": "Duplicado",
        "email": "agricultor@test.cl",
        "rut": "55.555.555-5",
        "password": "test1234",
        "rol": "agricultor"
    })
    assert res.status_code == 400
    assert "email" in res.json()["detail"].lower()

def test_login_exitoso(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "agricultor@test.cl",
        "password": "test1234"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["rol"] == "agricultor"

def test_login_password_incorrecta(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "agricultor@test.cl",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

def test_login_email_inexistente(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "noexiste@test.cl",
        "password": "test1234"
    })
    assert res.status_code == 401

def test_acceso_sin_token(client):
    res = client.get("/api/v1/listas/")
    assert res.status_code == 401

def test_acceso_rol_incorrecto(client, proveedor_token):
    # Proveedor no puede acceder a rutas de agricultor
    res = client.get("/api/v1/listas/",
        headers=auth_headers(proveedor_token))
    assert res.status_code == 403

def test_perfil_autenticado(client, agricultor_token):
    res = client.get("/api/v1/perfil/",
        headers=auth_headers(agricultor_token))
    assert res.status_code == 200
    assert res.json()["email"] == "agricultor@test.cl"
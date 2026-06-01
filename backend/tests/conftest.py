import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine_test
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    # Seedear insumo de prueba
    from app.models.insumo import Insumo
    db = TestingSessionLocal()
    if not db.query(Insumo).first():
        db.add(Insumo(
            nombre="Urea Test",
            categoria="fertilizante",
            unidad_medida="kg"
        ))
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine_test)

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def agricultor_token(client):
    client.post("/api/v1/auth/register", json={
        "nombre": "Agricultor Test",
        "email": "agricultor@test.cl",
        "rut": "11.111.111-1",
        "telefono": "+56911111111",
        "password": "test1234",
        "rol": "agricultor"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": "agricultor@test.cl",
        "password": "test1234"
    })
    return res.json()["access_token"]

@pytest.fixture(scope="session")
def proveedor_token(client):
    client.post("/api/v1/auth/register", json={
        "nombre": "Proveedor Test",
        "email": "proveedor@test.cl",
        "rut": "22.222.222-2",
        "telefono": "+56922222222",
        "password": "test1234",
        "rol": "proveedor"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": "proveedor@test.cl",
        "password": "test1234"
    })
    return res.json()["access_token"]

@pytest.fixture(scope="session")
def admin_token(client):
    client.post("/api/v1/auth/register", json={
        "nombre": "Admin Test",
        "email": "admin@test.cl",
        "rut": "33.333.333-3",
        "telefono": "+56933333333",
        "password": "test1234",
        "rol": "admin"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@test.cl",
        "password": "test1234"
    })
    return res.json()["access_token"]
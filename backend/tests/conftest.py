import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from backend.database import Base, get_db
from backend.main import app # Import your FastAPI app
from backend.models import Client # Import models that might be needed for pre-population

# Define the SQLite URL for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create a SQLAlchemy engine for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} # check_same_thread is needed for SQLite
)

# Create a sessionmaker to create database sessions
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture to create the database tables before tests run and drop them after
@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine) # Create tables
    yield
    Base.metadata.drop_all(bind=engine) # Drop tables after tests

# Fixture to provide a database session for tests, overriding the main get_db dependency
@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Provides a transactional database session for tests.
    Rolls back changes after each test.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Provides a TestClient instance that uses the test database session.
    """

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            db_session.close() # Ensure session is closed, though rollback handles data

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    del app.dependency_overrides[get_db] # Clean up override


# Example fixture to pre-populate data if needed for multiple tests
@pytest.fixture(scope="function")
def test_client_user(db_session: Session) -> Client:
    """
    Creates a sample client in the test database.
    """
    client_data = {
        "name": "Test Client User",
        "email": "testclient@example.com",
        "phone": "1234567890",
        "company_name": "Test Corp",
        "notes": "A client for testing purposes"
    }
    client = Client(**client_data)
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)
    return client

import pytest


@pytest.fixture(scope="session", autouse=True)
def set_test_database_url(monkeypatch):
    print("hello")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///test.db")

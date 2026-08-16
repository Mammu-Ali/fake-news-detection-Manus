import pytest
from flask_jwt_extended import create_access_token

from app import create_app
from app.config import TestConfig


@pytest.fixture()
def app():
    return create_app(TestConfig)


@pytest.fixture()
def client(app):
    return app.test_client()


def token(app, role="user"):
    with app.app_context():
        return create_access_token(identity="test-user", additional_claims={"role": role, "email": "test@example.com"})


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_prediction_requires_authentication(client):
    response = client.post("/api/predictions/analyze", json={"articleText": "This article is long enough to pass only the authentication boundary."})
    assert response.status_code == 401


def test_short_article_is_rejected(app, client):
    response = client.post("/api/predictions/analyze", json={"articleText": "too short"}, headers={"Authorization": f"Bearer {token(app)}"})
    assert response.status_code == 400
    assert "at least 40" in response.get_json()["error"]


def test_admin_route_rejects_regular_user(app, client):
    response = client.get("/api/admin/datasets", headers={"Authorization": f"Bearer {token(app, role='user')}"})
    assert response.status_code == 403


def test_admin_metric_validation(app, client):
    response = client.post("/api/admin/metrics", json={"modelName": "LSTM", "datasetName": "Corpus", "accuracy": 101, "precision": 90, "recall": 90, "f1Score": 90, "truePositive": 1, "trueNegative": 1, "falsePositive": 0, "falseNegative": 0}, headers={"Authorization": f"Bearer {token(app, role='admin')}"})
    assert response.status_code == 400
    assert "accuracy" in response.get_json()["error"]

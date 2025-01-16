
from fastapi.testclient import TestClient
from app import app
from schemas import FlowDto, NodeType


# Create a TestClient
client = TestClient(app)


# Helper function to create a flow
def create_sample_flow():
    return FlowDto(
        id="test-flow",
        name="Test Flow",
        nodes=[
            {
                "id": "node-1",
                "type": NodeType.READ_FROM_GOOGLE_DOCS,
                "config": "Test Document",
            },
            {
                "id": "node-2",
                "type": NodeType.PROMPT_LLM,
                "config": "Summarize the following text: {text}",
            },
            {
                "id": "node-3",
                "type": NodeType.WRITE_TO_GOOGLE_DOCS,
                "config": "Summary Document",
            },
        ],
    )


# Test cases
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_flow():
    sample_flow = create_sample_flow()
    response = client.post("/flows/", json=sample_flow.model_dump())
    assert response.status_code == 200
    assert response.json()["name"] == sample_flow.name


def test_get_all_flows():
    response = client.get("/flows/")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_get_flow():
    sample_flow = create_sample_flow()
    response = client.get(f"/flows/{sample_flow.id}")
    assert response.status_code == 200
    assert response.json()["name"] == sample_flow.name


def test_update_flow():
    sample_flow = create_sample_flow()
    updated_flow = sample_flow.model_copy()
    updated_flow.name = "Updated Test Flow"

    response = client.put(f"/flows/{sample_flow.id}", json=updated_flow.model_dump())
    assert response.status_code == 200
    assert response.json()["name"] == updated_flow.name


def test_delete_flow():
    sample_flow = create_sample_flow()
    response = client.delete(f"/flows/{sample_flow.id}")
    assert response.status_code == 204


def test_execute_flow():
    sample_flow = create_sample_flow()
    client.post("/flows/", json=sample_flow.model_dump())

    response = client.post(f"/flows/{sample_flow.id}/execute")
    assert response.status_code == 200
    assert "result" in response.json()


def test_get_nonexistent_flow():
    response = client.get("/flows/nonexistent-flow")
    assert response.status_code == 404
    assert response.json()["detail"] == "Flow not found."


def test_update_nonexistent_flow():
    sample_flow = create_sample_flow()
    response = client.put("/flows/nonexistent-flow", json=sample_flow.model_dump())
    assert response.status_code == 404
    assert response.json()["detail"] == "Flow not found."


def test_delete_nonexistent_flow():
    response = client.delete("/flows/nonexistent-flow")
    assert response.status_code == 404
    assert response.json()["detail"] == "Flow not found."

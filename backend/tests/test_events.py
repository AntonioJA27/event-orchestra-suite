import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from backend.models import Event as EventModel, Client as ClientModel # Import your SQLAlchemy models
from backend.schemas import EventCreate, EventStatus # Import your Pydantic schemas

# Helper function to create a valid event payload
def create_event_payload(client_id: int, venue: str = "Test Venue", days_from_now: int = 7) -> dict:
    event_date = datetime.now(timezone.utc).date() + timedelta(days=days_from_now)
    start_time = datetime(event_date.year, event_date.month, event_date.day, 10, 0, 0, tzinfo=timezone.utc)
    end_time = datetime(event_date.year, event_date.month, event_date.day, 12, 0, 0, tzinfo=timezone.utc)

    return {
        "name": f"Test Event at {venue}",
        "client_id": client_id,
        "event_type": "Test Type",
        "date": event_date.isoformat(),
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "venue": venue,
        "guests_count": 100,
        "budget": 5000.00,
        "notes": "Test notes for the event.",
    }

def test_create_event_success(client: TestClient, db_session: Session, test_client_user: ClientModel):
    """
    Test successful creation of an event.
    """
    payload = create_event_payload(client_id=test_client_user.id)

    response = client.post("/api/v1/events", json=payload)

    assert response.status_code == 200 # Or 201 if your API returns that
    data = response.json()

    assert "id" in data
    assert data["name"] == payload["name"]
    assert data["client_id"] == payload["client_id"]
    assert data["venue"] == payload["venue"]
    assert data["date"] == payload["date"]
    # Compare start_time and end_time by parsing them back to datetime objects for robustness
    assert datetime.fromisoformat(data["start_time"]) == datetime.fromisoformat(payload["start_time"])
    assert datetime.fromisoformat(data["end_time"]) == datetime.fromisoformat(payload["end_time"])
    assert data["guests_count"] == payload["guests_count"]
    assert data["budget"] == payload["budget"]
    assert data["notes"] == payload["notes"]
    assert data["status"] == EventStatus.PLANNED.value # Check default status

    # Verify the event was saved to the database
    db_event = db_session.query(EventModel).filter(EventModel.id == data["id"]).first()
    assert db_event is not None
    assert db_event.name == payload["name"]
    assert db_event.client_id == test_client_user.id
    assert db_event.venue == payload["venue"]
    # For datetime fields, ensure they are stored correctly (potentially with timezone awareness)
    # Date comparison needs care if stored as datetime in DB
    assert db_event.date.isoformat() == payload["date"]
    assert db_event.start_time.isoformat() == payload["start_time"]
    assert db_event.end_time.isoformat() == payload["end_time"]


def test_create_event_missing_client(client: TestClient):
    """
    Test event creation with a non-existent client_id.
    """
    payload = create_event_payload(client_id=99999) # Non-existent client ID

    response = client.post("/api/v1/events", json=payload)

    assert response.status_code == 404
    data = response.json()
    assert "Client not found" in data["detail"]


def test_create_event_venue_conflict(client: TestClient, db_session: Session, test_client_user: ClientModel):
    """
    Test event creation conflict due to venue and date combination.
    """
    # Create an initial event
    initial_payload = create_event_payload(client_id=test_client_user.id, venue="Unique Conference Hall", days_from_now=10)
    response1 = client.post("/api/v1/events", json=initial_payload)
    assert response1.status_code == 200
    event1_data = response1.json()

    # Attempt to create another event with the same venue and date
    conflict_payload = create_event_payload(client_id=test_client_user.id, venue="Unique Conference Hall", days_from_now=10)
    conflict_payload["name"] = "Conflicting Event" # Different name, same venue and date

    response2 = client.post("/api/v1/events", json=conflict_payload)

    assert response2.status_code == 400
    data = response2.json()
    assert "Venue is already booked for this date" in data["detail"]


def test_get_events_empty(client: TestClient):
    """
    Test getting events when no events exist.
    """
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    assert response.json() == []


def test_get_events_with_data(client: TestClient, db_session: Session, test_client_user: ClientModel):
    """
    Test getting events when events exist.
    """
    # Create a couple of events
    payload1 = create_event_payload(client_id=test_client_user.id, venue="Venue A", days_from_now=5)
    response1 = client.post("/api/v1/events", json=payload1)
    assert response1.status_code == 200
    event1_data = response1.json()

    payload2 = create_event_payload(client_id=test_client_user.id, venue="Venue B", days_from_now=6)
    # Ensure different start/end times if date is the same for payload2, or different date
    payload2["start_time"] = (datetime.fromisoformat(payload2["start_time"]) + timedelta(hours=1)).isoformat()
    payload2["end_time"] = (datetime.fromisoformat(payload2["end_time"]) + timedelta(hours=1)).isoformat()

    response2 = client.post("/api/v1/events", json=payload2)
    assert response2.status_code == 200
    event2_data = response2.json()
    
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 2
    event_ids_in_response = {event["id"] for event in data}
    assert event1_data["id"] in event_ids_in_response
    assert event2_data["id"] in event_ids_in_response
    # Further checks can be done to ensure all data matches


def test_get_event_by_id_success(client: TestClient, db_session: Session, test_client_user: ClientModel):
    """
    Test getting a single event by its ID successfully.
    """
    payload = create_event_payload(client_id=test_client_user.id, venue="Specific Venue", days_from_now=3)
    create_response = client.post("/api/v1/events", json=payload)
    assert create_response.status_code == 200
    created_event_data = create_response.json()
    event_id = created_event_data["id"]

    response = client.get(f"/api/v1/events/{event_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == event_id
    assert data["name"] == payload["name"]
    assert data["venue"] == payload["venue"]
    assert data["date"] == payload["date"]
    assert datetime.fromisoformat(data["start_time"]) == datetime.fromisoformat(payload["start_time"])


def test_get_event_by_id_not_found(client: TestClient):
    """
    Test getting a single event by a non-existent ID.
    """
    non_existent_event_id = 99999
    response = client.get(f"/api/v1/events/{non_existent_event_id}")
    assert response.status_code == 404
    data = response.json()
    assert "Event not found" in data["detail"]

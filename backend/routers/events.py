
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import Event, Client, EventStatus
from schemas import EventCreate, EventResponse, EventUpdate

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
async def get_events(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """Obtener lista de eventos con filtros opcionales"""
    query = db.query(Event)
    
    if status_filter:
        query = query.filter(Event.status == status_filter)
    
    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Obtener evento específico por ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    return event

@router.post("/", response_model=EventResponse)
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """Crear nuevo evento"""
    # Verificar que el cliente existe
    client = db.query(Client).filter(Client.id == event.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    # Verificar disponibilidad del venue en la fecha
    existing_event = db.query(Event).filter(
        Event.venue == event.venue,
        Event.date == event.date,
        Event.status != EventStatus.CANCELLED
    ).first()
    
    if existing_event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El venue no está disponible en esa fecha"
        )
    
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar evento existente"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Eliminar evento"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    db.delete(event)
    db.commit()
    return {"message": "Evento eliminado exitosamente"}

@router.get("/{event_id}/availability")
async def check_availability(event_id: int, db: Session = Depends(get_db)):
    """Verificar disponibilidad de recursos para un evento"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Aquí implementarías la lógica para verificar disponibilidad
    # de personal, inventario, venues, etc.
    
    return {
        "event_id": event_id,
        "venue_available": True,
        "staff_available": True,
        "inventory_sufficient": True,
        "recommendations": []
    }

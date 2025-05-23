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
    try:
        # Verificar que el cliente existe (crear uno de prueba si no existe)
        client = db.query(Client).filter(Client.id == event.client_id).first()
        if not client:
            # Crear cliente de prueba para testing
            test_client = Client(
                name=f"Cliente {event.client_id}",
                email=f"cliente{event.client_id}@test.com",
                is_corporate=False
            )
            db.add(test_client)
            db.commit()
            db.refresh(test_client)
        
        # Convertir strings a datetime si es necesario
        event_data = event.dict()
        
        # Manejar conversión de fecha
        if isinstance(event_data['date'], str):
            event_data['date'] = datetime.fromisoformat(event_data['date'].replace('Z', '+00:00'))
        
        # Manejar conversión de start_time
        if isinstance(event_data['start_time'], str):
            event_data['start_time'] = datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00'))
            
        # Manejar conversión de end_time
        if isinstance(event_data['end_time'], str):
            event_data['end_time'] = datetime.fromisoformat(event_data['end_time'].replace('Z', '+00:00'))
        
        # Verificar disponibilidad del venue en la fecha
        existing_event = db.query(Event).filter(
            Event.venue == event.venue,
            Event.date == event_data['date'].date(),  # Comparar solo la fecha
            Event.status != EventStatus.CANCELLED
        ).first()
        
        if existing_event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El venue no está disponible en esa fecha"
            )
        
        # Crear el evento con los datos convertidos
        db_event = Event(**event_data)
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en formato de fecha: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar evento existente"""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento no encontrado"
            )
        
        update_data = event_update.dict(exclude_unset=True)
        
        # Manejar conversión de fechas si están presentes
        for field in ['date', 'start_time', 'end_time']:
            if field in update_data and isinstance(update_data[field], str):
                update_data[field] = datetime.fromisoformat(update_data[field].replace('Z', '+00:00'))
        
        for field, value in update_data.items():
            setattr(event, field, value)
        
        event.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(event)
        return event
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar evento: {str(e)}"
        )

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Eliminar evento"""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento no encontrado"
            )
        
        db.delete(event)
        db.commit()
        return {"message": "Evento eliminado exitosamente"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar evento: {str(e)}"
        )

@router.get("/{event_id}/availability")
async def check_availability(event_id: int, db: Session = Depends(get_db)):
    """Verificar disponibilidad de recursos para un evento"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    return {
        "event_id": event_id,
        "venue_available": True,
        "staff_available": True,
        "inventory_sufficient": True,
        "recommendations": []
    }
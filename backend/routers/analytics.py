
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from models import Event, EventStatus
from schemas import AnalyticsResponse, RevenueData, EventTypeStats

router = APIRouter()

@router.get("/summary", response_model=AnalyticsResponse)
async def get_analytics_summary(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    """Get summary analytics data for the business"""
    # Default to last 12 months if no dates specified
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=365)
    
    # Query for completed events within date range
    events_query = db.query(Event).filter(
        Event.status == EventStatus.COMPLETED,
        Event.date >= start_date,
        Event.date <= end_date
    )
    
    # Count total events and revenue
    total_events = events_query.count()
    total_revenue = db.query(func.sum(Event.budget)).scalar() or 0
    
    # Calculate monthly revenue
    monthly_revenue = []
    current_date = start_date
    while current_date <= end_date:
        month_end = datetime(current_date.year, current_date.month, 1) + timedelta(days=32)
        month_end = datetime(month_end.year, month_end.month, 1) - timedelta(days=1)
        
        month_events = events_query.filter(
            func.extract('year', Event.date) == current_date.year,
            func.extract('month', Event.date) == current_date.month
        )
        
        month_count = month_events.count()
        month_revenue = sum(event.budget for event in month_events)
        
        month_name = current_date.strftime("%B %Y")
        monthly_revenue.append(
            RevenueData(
                month=month_name,
                revenue=month_revenue,
                events_count=month_count
            )
        )
        
        # Move to next month
        if current_date.month == 12:
            current_date = datetime(current_date.year + 1, 1, 1)
        else:
            current_date = datetime(current_date.year, current_date.month + 1, 1)
    
    # Calculate event type statistics
    event_types = db.query(
        Event.event_type,
        func.count(Event.id),
        func.sum(Event.budget)
    ).filter(
        Event.status == EventStatus.COMPLETED,
        Event.date >= start_date,
        Event.date <= end_date
    ).group_by(Event.event_type).all()
    
    event_type_stats = []
    for event_type, count, revenue in event_types:
        percentage = (count / total_events) * 100 if total_events > 0 else 0
        event_type_stats.append(
            EventTypeStats(
                event_type=event_type,
                count=count,
                revenue=revenue or 0,
                percentage=percentage
            )
        )
    
    # Calculate average satisfaction (placeholder - would need actual rating data)
    # For now, using a dummy value
    average_satisfaction = 4.5
    
    return AnalyticsResponse(
        monthly_revenue=monthly_revenue,
        event_types=event_type_stats,
        total_events=total_events,
        total_revenue=total_revenue,
        average_satisfaction=average_satisfaction
    )

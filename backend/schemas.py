
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from models import EventStatus, StaffStatus

# Event Schemas
class EventBase(BaseModel):
    name: str
    client_id: int
    event_type: str
    date: datetime
    start_time: datetime
    end_time: datetime
    venue: str
    guests_count: int
    budget: float
    notes: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    venue: Optional[str] = None
    guests_count: Optional[int] = None
    budget: Optional[float] = None
    status: Optional[EventStatus] = None
    notes: Optional[str] = None

class EventResponse(EventBase):
    id: int
    status: EventStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Client Schemas
class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    is_corporate: Optional[bool] = False

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Staff Schemas
class StaffBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    specialty: Optional[str] = None
    hourly_rate: Optional[float] = None

class StaffCreate(StaffBase):
    pass

class StaffResponse(StaffBase):
    id: int
    status: StaffStatus
    rating: float
    total_events: int
    created_at: datetime

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryItemBase(BaseModel):
    name: str
    category: str
    current_stock: int
    minimum_stock: int
    maximum_stock: int
    unit_cost: Optional[float] = None
    location: Optional[str] = None
    supplier: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemResponse(InventoryItemBase):
    id: int
    last_restocked: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Schemas
class RevenueData(BaseModel):
    month: str
    revenue: float
    events_count: int

class EventTypeStats(BaseModel):
    event_type: str
    count: int
    revenue: float
    percentage: float

class AnalyticsResponse(BaseModel):
    monthly_revenue: List[RevenueData]
    event_types: List[EventTypeStats]
    total_events: int
    total_revenue: float
    average_satisfaction: float


from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class EventStatus(enum.Enum):
    PLANNING = "planning"
    CONFIRMED = "confirmed"
    IN_PREPARATION = "in_preparation"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class StaffStatus(enum.Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    ON_EVENT = "on_event"
    UNAVAILABLE = "unavailable"

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"))
    event_type = Column(String(50), nullable=False)
    date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    venue = Column(String(100), nullable=False)
    guests_count = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.PLANNING)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="events")
    staff_assignments = relationship("StaffAssignment", back_populates="event")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    company = Column(String(100))
    is_corporate = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    events = relationship("Event", back_populates="client")

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    role = Column(String(50), nullable=False)
    specialty = Column(String(100))
    hourly_rate = Column(Float)
    status = Column(Enum(StaffStatus), default=StaffStatus.AVAILABLE)
    rating = Column(Float, default=0.0)
    total_events = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    assignments = relationship("StaffAssignment", back_populates="staff_member")

class StaffAssignment(Base):
    __tablename__ = "staff_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    staff_id = Column(Integer, ForeignKey("staff.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    
    # Relationships
    event = relationship("Event", back_populates="staff_assignments")
    staff_member = relationship("Staff", back_populates="assignments")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    current_stock = Column(Integer, nullable=False)
    minimum_stock = Column(Integer, nullable=False)
    maximum_stock = Column(Integer, nullable=False)
    unit_cost = Column(Float)
    location = Column(String(100))
    supplier = Column(String(100))
    last_restocked = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    category = Column(String(50))
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

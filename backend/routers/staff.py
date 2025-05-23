
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Staff, StaffStatus
from schemas import StaffCreate, StaffResponse

router = APIRouter()

@router.get("/", response_model=List[StaffResponse])
async def get_staff(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """Get a list of all staff members with optional status filtering"""
    query = db.query(Staff)
    
    if status_filter:
        query = query.filter(Staff.status == status_filter)
    
    staff = query.offset(skip).limit(limit).all()
    return staff

@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff_member(staff_id: int, db: Session = Depends(get_db)):
    """Get a specific staff member by ID"""
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    return staff

@router.post("/", response_model=StaffResponse)
async def create_staff_member(staff: StaffCreate, db: Session = Depends(get_db)):
    """Create a new staff member"""
    # Check if staff with the same email already exists
    existing_staff = db.query(Staff).filter(Staff.email == staff.email).first()
    if existing_staff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_staff = Staff(**staff.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff_member(
    staff_id: int,
    staff_data: StaffCreate,
    db: Session = Depends(get_db)
):
    """Update an existing staff member"""
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    # Check if updated email conflicts with another staff member
    if staff_data.email != staff.email:
        existing_staff = db.query(Staff).filter(Staff.email == staff_data.email).first()
        if existing_staff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    for key, value in staff_data.dict().items():
        setattr(staff, key, value)
    
    db.commit()
    db.refresh(staff)
    return staff

@router.put("/{staff_id}/status")
async def update_staff_status(
    staff_id: int,
    status: StaffStatus,
    db: Session = Depends(get_db)
):
    """Update a staff member's status"""
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    staff.status = status
    db.commit()
    db.refresh(staff)
    return {"message": "Status updated successfully", "status": status}


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import InventoryItem
from schemas import InventoryItemCreate, InventoryItemResponse

router = APIRouter()

@router.get("/", response_model=List[InventoryItemResponse])
async def get_inventory_items(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    low_stock: bool = False,
    db: Session = Depends(get_db)
):
    """Get a list of inventory items with optional filters"""
    query = db.query(InventoryItem)
    
    if category:
        query = query.filter(InventoryItem.category == category)
    
    if low_stock:
        query = query.filter(InventoryItem.current_stock <= InventoryItem.minimum_stock)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific inventory item by ID"""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return item

@router.post("/", response_model=InventoryItemResponse)
async def create_inventory_item(item: InventoryItemCreate, db: Session = Depends(get_db)):
    """Create a new inventory item"""
    db_item = InventoryItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: int,
    item_data: InventoryItemCreate,
    db: Session = Depends(get_db)
):
    """Update an existing inventory item"""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    for key, value in item_data.dict().items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.put("/{item_id}/restock", response_model=InventoryItemResponse)
async def restock_inventory_item(
    item_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    """Restock an inventory item"""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restock quantity must be greater than zero"
        )
    
    item.current_stock += quantity
    item.last_restocked = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    return item

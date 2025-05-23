from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import uvicorn

from database import engine, get_db
from models import Base
from routers import events, clients, staff, inventory, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 BanquetPro API starting up...")
    yield
    # Shutdown
    print("💤 BanquetPro API shutting down...")

app = FastAPI(
    title="BanquetPro API",
    description="API para gestión integral de eventos y banquetes",
    version="1.0.0",
    lifespan=lifespan
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "BanquetPro API"}

# Include routers
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(clients.router, prefix="/api/v1/clients", tags=["Clients"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "BanquetPro API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

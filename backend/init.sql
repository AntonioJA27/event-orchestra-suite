
-- Initialize database schema and initial data

-- Create extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Create tables if they don't exist (if not handled by SQLAlchemy)
-- This is just a placeholder - your actual schema will be created by SQLAlchemy's Base.metadata.create_all

-- Create initial admin user if needed
-- INSERT INTO users (name, email, password, role)
-- VALUES ('Admin', 'admin@banquet.pro', 'hashed_password', 'admin')
-- ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE banquet_db TO banquet_user;

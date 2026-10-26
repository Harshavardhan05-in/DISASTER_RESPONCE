-- Run this manually if not using Docker:
-- psql -U postgres -f scripts/init_db.sql

CREATE USER IF NOT EXISTS dr360 WITH PASSWORD 'dev_password_change_in_prod';
CREATE DATABASE disaster_response_360 OWNER dr360;
\c disaster_response_360;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL PRIVILEGES ON DATABASE disaster_response_360 TO dr360;

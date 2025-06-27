-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS invoice_generator;

-- Use the database
USE invoice_generator;

-- The tables will be created by Prisma migrations
-- Run: npx prisma migrate dev --name init
-- This will create all the tables defined in the schema.prisma file

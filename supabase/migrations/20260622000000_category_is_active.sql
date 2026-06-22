-- Migration to add is_active column to categories table
ALTER TABLE categories
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

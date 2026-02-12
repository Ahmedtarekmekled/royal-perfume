-- Add is_featured column to categories table
ALTER TABLE categories 
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- AlterTable: Add bufferTime to users table
ALTER TABLE "users" ADD COLUMN "bufferTime" INTEGER;

-- AlterTable: Add defaultBufferTime to clinic_settings table
ALTER TABLE "clinic_settings" ADD COLUMN "defaultBufferTime" INTEGER NOT NULL DEFAULT 0;




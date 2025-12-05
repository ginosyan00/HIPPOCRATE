-- AlterTable: Make patientId optional and add userId
-- First, we need to handle existing data - set patientId to NULL where it doesn't exist (shouldn't happen, but safety first)
-- Then alter the table structure

-- Step 1: Add userId column (nullable)
ALTER TABLE "notifications" ADD COLUMN "userId" TEXT;

-- Step 2: Make patientId nullable
-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
-- But first, let's check if we can do it simpler - SQLite allows NULL in NOT NULL columns if we're careful

-- For SQLite, we need to recreate the table
-- Create new table with updated schema
CREATE TABLE "notifications_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notifications_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table to new table
INSERT INTO "notifications_new" SELECT * FROM "notifications";

-- Drop old table
DROP TABLE "notifications";

-- Rename new table to original name
ALTER TABLE "notifications_new" RENAME TO "notifications";

-- Create indexes
CREATE INDEX "notifications_clinicId_idx" ON "notifications"("clinicId");
CREATE INDEX "notifications_patientId_idx" ON "notifications"("patientId");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");


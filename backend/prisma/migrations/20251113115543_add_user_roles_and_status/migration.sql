/*
  Warnings:

  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PATIENT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "avatar" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "experience" INTEGER,
    "organizationName" TEXT,
    "organizationType" TEXT,
    "inn" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("avatar", "clinicId", "createdAt", "email", "id", "name", "passwordHash", "phone", "role", "specialization", "updatedAt") SELECT "avatar", "clinicId", "createdAt", "email", "id", "name", "passwordHash", "phone", "role", "specialization", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_clinicId_idx" ON "users"("clinicId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_status_idx" ON "users"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

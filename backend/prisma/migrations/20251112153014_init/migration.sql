-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "about" TEXT,
    "logo" TEXT,
    "workingHours" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "specialization" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "patients_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appointments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clinicId_idx" ON "users"("clinicId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "patients_clinicId_idx" ON "patients"("clinicId");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "appointments_clinicId_idx" ON "appointments"("clinicId");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_idx" ON "appointments"("appointmentDate");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

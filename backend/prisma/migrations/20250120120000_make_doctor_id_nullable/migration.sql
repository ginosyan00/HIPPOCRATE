-- SQLite не поддерживает ALTER TABLE для изменения foreign key constraints напрямую
-- Поэтому мы используем подход с пересозданием таблицы

-- 1. Создаем новую таблицу с nullable doctorId
CREATE TABLE "appointments_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "doctorId" TEXT,
    "patientId" TEXT NOT NULL,
    "appointmentDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "reason" TEXT,
    "amount" REAL,
    "registeredAt" DATETIME,
    "cancellationReason" TEXT,
    "suggestedNewDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appointments_new_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_new_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "appointments_new_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 2. Копируем данные из старой таблицы
INSERT INTO "appointments_new" SELECT * FROM "appointments";

-- 3. Удаляем старую таблицу
DROP TABLE "appointments";

-- 4. Переименовываем новую таблицу
ALTER TABLE "appointments_new" RENAME TO "appointments";

-- 5. Восстанавливаем индексы
CREATE INDEX "appointments_clinicId_idx" ON "appointments"("clinicId");
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");
CREATE INDEX "appointments_appointmentDate_idx" ON "appointments"("appointmentDate");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");


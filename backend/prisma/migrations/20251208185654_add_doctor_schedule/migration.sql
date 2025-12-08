-- CreateTable
CREATE TABLE "doctor_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "doctor_schedules_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_doctorId_dayOfWeek_key" ON "doctor_schedules"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "doctor_schedules_doctorId_idx" ON "doctor_schedules"("doctorId");

-- CreateIndex
CREATE INDEX "doctor_schedules_dayOfWeek_idx" ON "doctor_schedules"("dayOfWeek");


-- CreateTable
CREATE TABLE "daily_advice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfYear" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ru',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_advice_dayOfYear_language_key" ON "daily_advice"("dayOfYear", "language");
CREATE INDEX "daily_advice_dayOfYear_idx" ON "daily_advice"("dayOfYear");
CREATE INDEX "daily_advice_language_idx" ON "daily_advice"("language");
CREATE INDEX "daily_advice_isActive_idx" ON "daily_advice"("isActive");


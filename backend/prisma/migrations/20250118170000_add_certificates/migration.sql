-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "certificateNumber" TEXT,
    "issuedBy" TEXT,
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "certificates_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "certificates_clinicId_idx" ON "certificates"("clinicId");
CREATE INDEX "certificates_isVerified_idx" ON "certificates"("isVerified");


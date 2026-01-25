/*
  Warnings:

  - Added the required column `organizationId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `business_hours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create default organization for existing data
INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add all existing users to default organization as OWNER (if ADMIN) or CLIENT
INSERT INTO "organization_members" ("id", "userId", "organizationId", "role", "isActive", "createdAt", "updatedAt")
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
    "id",
    '00000000-0000-0000-0000-000000000001',
    CASE WHEN "role" = 'ADMIN' THEN 'OWNER' ELSE 'CLIENT' END,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appointments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_appointments" ("createdAt", "endTime", "id", "notes", "serviceId", "startTime", "status", "updatedAt", "userId", "organizationId") 
SELECT "createdAt", "endTime", "id", "notes", "serviceId", "startTime", "status", "updatedAt", "userId", '00000000-0000-0000-0000-000000000001' FROM "appointments";
DROP TABLE "appointments";
ALTER TABLE "new_appointments" RENAME TO "appointments";
CREATE INDEX "appointments_startTime_idx" ON "appointments"("startTime");
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");
CREATE INDEX "appointments_serviceId_idx" ON "appointments"("serviceId");
CREATE INDEX "appointments_organizationId_idx" ON "appointments"("organizationId");
CREATE TABLE "new_business_hours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "business_hours_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_business_hours" ("closeTime", "createdAt", "dayOfWeek", "id", "isOpen", "openTime", "updatedAt", "organizationId") 
SELECT "closeTime", "createdAt", "dayOfWeek", "id", "isOpen", "openTime", "updatedAt", '00000000-0000-0000-0000-000000000001' FROM "business_hours";
DROP TABLE "business_hours";
ALTER TABLE "new_business_hours" RENAME TO "business_hours";
CREATE INDEX "business_hours_organizationId_idx" ON "business_hours"("organizationId");
CREATE UNIQUE INDEX "business_hours_organizationId_dayOfWeek_key" ON "business_hours"("organizationId", "dayOfWeek");
CREATE TABLE "new_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "services_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_services" ("createdAt", "description", "duration", "id", "isActive", "name", "price", "updatedAt", "organizationId") 
SELECT "createdAt", "description", "duration", "id", "isActive", "name", "price", "updatedAt", '00000000-0000-0000-0000-000000000001' FROM "services";
DROP TABLE "services";
ALTER TABLE "new_services" RENAME TO "services";
CREATE INDEX "services_organizationId_idx" ON "services"("organizationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");

-- CreateIndex
CREATE INDEX "organization_members_organizationId_idx" ON "organization_members"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");

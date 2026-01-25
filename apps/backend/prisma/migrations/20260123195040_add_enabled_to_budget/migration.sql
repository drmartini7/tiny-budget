-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "periodType" TEXT NOT NULL,
    "overflowPolicy" TEXT NOT NULL,
    "overflowLimit" REAL,
    "startDate" DATETIME NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Budget_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("createdAt", "currency", "id", "name", "overflowLimit", "overflowPolicy", "ownerId", "periodType", "startDate", "updatedAt") SELECT "createdAt", "currency", "id", "name", "overflowLimit", "overflowPolicy", "ownerId", "periodType", "startDate", "updatedAt" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
CREATE INDEX "Budget_ownerId_idx" ON "Budget"("ownerId");
CREATE INDEX "Budget_periodType_idx" ON "Budget"("periodType");
CREATE INDEX "Budget_enabled_idx" ON "Budget"("enabled");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "executionDay" INTEGER,
    "runOnPeriodReset" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "description" TEXT NOT NULL,
    "lastExecutedAt" DATETIME,
    CONSTRAINT "Rule_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rule" ("amount", "budgetId", "description", "endDate", "executionDay", "frequency", "id", "lastExecutedAt", "startDate") SELECT "amount", "budgetId", "description", "endDate", "executionDay", "frequency", "id", "lastExecutedAt", "startDate" FROM "Rule";
DROP TABLE "Rule";
ALTER TABLE "new_Rule" RENAME TO "Rule";
CREATE INDEX "Rule_budgetId_idx" ON "Rule"("budgetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

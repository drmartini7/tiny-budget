/*
  Warnings:

  - A unique constraint covering the columns `[budgetId,startDate,endDate]` on the table `BudgetPeriod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[budgetId,frequency,executionDay,startDate]` on the table `Rule` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "periodId" TEXT,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "merchant" TEXT,
    "type" TEXT NOT NULL,
    "sourceRuleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "BudgetPeriod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "budgetId", "createdAt", "date", "description", "id", "merchant", "periodId", "sourceRuleId", "type") SELECT "amount", "budgetId", "createdAt", "date", "description", "id", "merchant", "periodId", "sourceRuleId", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_budgetId_date_idx" ON "Transaction"("budgetId", "date");
CREATE INDEX "Transaction_periodId_idx" ON "Transaction"("periodId");
CREATE INDEX "Transaction_sourceRuleId_idx" ON "Transaction"("sourceRuleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Budget_ownerId_idx" ON "Budget"("ownerId");

-- CreateIndex
CREATE INDEX "Budget_periodType_idx" ON "Budget"("periodType");

-- CreateIndex
CREATE INDEX "BudgetPeriod_budgetId_status_idx" ON "BudgetPeriod"("budgetId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPeriod_budgetId_startDate_endDate_key" ON "BudgetPeriod"("budgetId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Person_email_idx" ON "Person"("email");

-- CreateIndex
CREATE INDEX "Rule_budgetId_idx" ON "Rule"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_budgetId_frequency_executionDay_startDate_key" ON "Rule"("budgetId", "frequency", "executionDay", "startDate");

-- Additive metadata for destination-enforced transaction import idempotency.
CREATE TABLE "transaction_imports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "sourceSystem" VARCHAR(64) NOT NULL,
    "sourceRecordId" VARCHAR(128) NOT NULL,
    "payloadHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_imports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "transaction_imports_transactionId_key"
ON "transaction_imports"("transactionId");

CREATE UNIQUE INDEX "transaction_imports_userId_sourceSystem_sourceRecordId_key"
ON "transaction_imports"("userId", "sourceSystem", "sourceRecordId");

CREATE INDEX "transaction_imports_userId_createdAt_idx"
ON "transaction_imports"("userId", "createdAt" DESC);

ALTER TABLE "transaction_imports"
ADD CONSTRAINT "transaction_imports_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transaction_imports"
ADD CONSTRAINT "transaction_imports_transactionId_fkey"
FOREIGN KEY ("transactionId") REFERENCES "transactions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

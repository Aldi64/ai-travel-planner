-- CreateEnum
CREATE TYPE "AreaCategory" AS ENUM ('TOURIST_AREA', 'LANDMARK', 'NATURE', 'FOOD', 'TRANSPORTATION');

-- CreateTable
CREATE TABLE "AreaSearchCache" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" "AreaCategory" NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AreaSearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPlace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "AreaCategory" NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "photoUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AreaSearchCache_city_category_key" ON "AreaSearchCache"("city", "category");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPlace_userId_category_name_city_key" ON "SavedPlace"("userId", "category", "name", "city");

-- AddForeignKey
ALTER TABLE "SavedPlace" ADD CONSTRAINT "SavedPlace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

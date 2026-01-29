-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- Migrate existing photos data
INSERT INTO "photos" ("id", "pet_id", "url", "created_at")
SELECT
    gen_random_uuid()::text,
    p.id,
    unnest(p.photos),
    p.created_at
FROM "pets" p
WHERE array_length(p.photos, 1) > 0;

-- DropColumn
ALTER TABLE "pets" DROP COLUMN "photos";

-- CreateIndex
CREATE INDEX "photos_pet_id_idx" ON "photos"("pet_id");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

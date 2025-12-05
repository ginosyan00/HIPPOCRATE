import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Database
 * Դատարկ seed ֆայլ - աշխատեք միայն բազայի հետ
 * Տվյալները ավելացրեք ուղղակի SQLite-ում (Prisma Studio-ով)
 */
async function main() {
  console.log('🌱 Seed file is empty - work directly with database');
  console.log('🔍 Use Prisma Studio to add data: npx prisma studio');
  console.log('');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


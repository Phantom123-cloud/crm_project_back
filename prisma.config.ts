import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Загружаем .env вручную (ВАЖНО!)
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log(">>> DATABASE_URL loaded manually:", process.env.DATABASE_URL);

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});

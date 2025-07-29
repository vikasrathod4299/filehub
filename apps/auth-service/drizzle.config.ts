import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres:rathod1234vikas@localhost:5432/Filehub',
  },
  verbose: true,
  strict: true,
});

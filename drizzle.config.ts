import { defineConfig } from 'drizzle-kit';
import * as path from 'node:path';

const dbDir = process.env.DB_PATH
	? path.resolve(process.env.DB_PATH)
	: path.join(process.cwd(), '.database');

export default defineConfig({
	schema: './app/db.server/schema.ts',
	out: './migrations',
	dialect: 'sqlite',
	dbCredentials: {
		url: path.join(dbDir, 'database.db'),
	},
});

import { sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { v4 as uuid } from 'uuid';

const stringId = (name: string) =>
	text(name)
		.primaryKey()
		.notNull()
		.$defaultFn(() => uuid());

const createdAt = () =>
	text('created_at')
		.notNull()
		.$default(() => sql`CURRENT_TIMESTAMP`);

export const password = sqliteTable('password', {
	id: stringId('id'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	password: text('password').notNull(),
	createdAt: createdAt(),
});

export const user = sqliteTable('user', {
	id: stringId('id'),
	email: text('email').unique().notNull(),
	fullName: text('full_name').notNull(),
	displayName: text('display_name').notNull(),
});

const schema = {
	password,
	user,
};

export default schema;

export type DB = DrizzleD1Database<typeof schema>;

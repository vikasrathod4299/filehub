import {
  pgTable,
  serial,
  timestamp,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';
import { user } from './';

const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull(),
  userId: integer('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  isRevoked: integer('is_revoked').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  userAgent: varchar('user_agent', { length: 225 }),
  ipAddress: varchar('ip_adress', { length: 255 }),
});

export type SelectRefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;

export default refreshTokens;

import { SQL, and, eq, ilike } from 'drizzle-orm';
import db from '../../src/db/client';
import {
  user,
  InsertUser,
  SelectUser,
  refreshTokens,
  InsertRefreshToken,
  SelectRefreshToken,
} from '../db/schema';

export const getUsers = async () => {
  try {
    return await db.select().from(user);
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching users');
  }
};

export const createUser = async (payload: InsertUser) => {
  try {
    await db.insert(user).values(payload);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Data is not inserted!');
  }
};

export const getUserByFilter = async (filter: Partial<SelectUser>) => {
  try {
    const query: SQL[] = [];

    if (filter.id) query.push(eq(user.id, filter.id));
    if (filter.phone) query.push(eq(user.phone, filter.phone));
    if (filter.email) query.push(eq(user.email, filter.email));
    if (filter.name) query.push(ilike(user.name, filter.name));

    const users = await db
      .select()
      .from(user)
      .where(and(...query));

    return users;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching user!');
  }
};

export const addRefreshToken = async (payload: InsertRefreshToken) => {
  try {
    await db.insert(refreshTokens).values(payload);
  } catch (error) {
    console.error(error);
    throw new Error('Error adding refresh token');
  }
};

export const getRefrehTokenByFilter = async (
  filter: Partial<SelectRefreshToken>,
) => {
  try {
    const query: SQL[] = [];

    if (filter.id) query.push(eq(refreshTokens.id, filter.id));
    if (filter.token) query.push(eq(refreshTokens.token, filter.token));
    if (filter.userId) query.push(eq(refreshTokens.userId, filter.userId));

    const tokens = await db
      .select()
      .from(refreshTokens)
      .where(and(...query));

    return tokens;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching refresh token!');
  }
};

export const updateRefreshToken = async (
  id: number,
  payload: Partial<InsertRefreshToken>,
) => {
  try {
    await db.update(refreshTokens).set(payload).where(eq(refreshTokens.id, id));
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating refresh token');
  }
};

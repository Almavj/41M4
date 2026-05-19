import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  return user ?? null;
}

export async function findUserByUsername(username: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username.toLowerCase()));
  return user ?? null;
}

export async function findUserById(id: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return user ?? null;
}

export async function createUser(username: string, email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ username: username.toLowerCase(), email: email.toLowerCase(), passwordHash })
    .returning();
  return user;
}

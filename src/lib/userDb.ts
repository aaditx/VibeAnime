import bcrypt from "bcryptjs";
import { getMongoClient } from "@/lib/mongodb";

const DB_NAME = "vibeanime";
const COLLECTION = "users";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

async function getCollection() {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection<User>(COLLECTION);
}

// Seed demo user if the collection is empty
async function maybeSeedDemo() {
  const col = await getCollection();
  await col.createIndex({ email: 1 }, { unique: true });
  const count = await col.countDocuments();
  if (count === 0) {
    const demoHash = await bcrypt.hash("demo123", 10);
    await col.insertOne({
      id: "demo-user-1",
      name: "Demo User",
      email: "demo@vibeanime.com",
      passwordHash: demoHash,
      createdAt: new Date().toISOString(),
    });
  }
}

// Initialise once — runs lazily on first call
let initialised = false;
async function init() {
  if (initialised) return;
  await maybeSeedDemo();
  initialised = true;
}

export async function getUsers(): Promise<User[]> {
  await init();
  const col = await getCollection();
  return col.find({}, { projection: { _id: 0 } }).toArray();
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  await init();
  const col = await getCollection();
  const user = await col.findOne(
    { email: email.toLowerCase() },
    { projection: { _id: 0 } }
  );
  return user ?? undefined;
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  await init();
  const col = await getCollection();

  const existing = await col.findOne({ email: email.toLowerCase() });
  if (existing) throw new Error("User already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await col.insertOne(newUser);
  return newUser;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Password reset tokens ────────────────────────────────────────────────────

interface ResetToken {
  token: string;
  email: string;
  expiresAt: Date;
}

async function getTokenCollection() {
  const client = await getMongoClient();
  const col = client.db(DB_NAME).collection<ResetToken>("resetTokens");
  // Auto-delete expired tokens
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return col;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const users = await getUserByEmail(email);
  if (!users) return null; // don't reveal if email exists

  const col = await getTokenCollection();
  // Remove any existing token for this email
  await col.deleteMany({ email: email.toLowerCase() });

  const token = crypto.randomUUID();
  await col.insertOne({
    token,
    email: email.toLowerCase(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
  return token;
}

export async function verifyAndConsumeResetToken(token: string): Promise<string | null> {
  const col = await getTokenCollection();
  const record = await col.findOneAndDelete({
    token,
    expiresAt: { $gt: new Date() },
  });
  return record?.email ?? null;
}

export async function updateUserPassword(email: string, newPassword: string): Promise<void> {
  const col = await getCollection();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await col.updateOne(
    { email: email.toLowerCase() },
    { $set: { passwordHash } }
  );
}

// ─── Watch Progress ───────────────────────────────────────────────────────────

export interface WatchProgressEntry {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  coverColor: string | null;
  episode: number;
  totalEpisodes: number | null;
  updatedAt: string;
}

async function getProgressCollection() {
  const client = await getMongoClient();
  const col = client.db(DB_NAME).collection<WatchProgressEntry & { userId: string }>("watchProgress");
  await col.createIndex({ userId: 1, animeId: 1 }, { unique: true });
  return col;
}

export async function getWatchProgress(userId: string): Promise<WatchProgressEntry[]> {
  const col = await getProgressCollection();
  return col
    .find({ userId }, { projection: { _id: 0, userId: 0 } })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();
}

export async function upsertWatchProgress(userId: string, entry: WatchProgressEntry): Promise<void> {
  const col = await getProgressCollection();
  await col.updateOne(
    { userId, animeId: entry.animeId },
    { $set: { ...entry, userId } },
    { upsert: true }
  );
}

export async function deleteWatchProgress(userId: string, animeId: number): Promise<void> {
  const col = await getProgressCollection();
  await col.deleteOne({ userId, animeId });
}

export async function clearWatchProgress(userId: string): Promise<void> {
  const col = await getProgressCollection();
  await col.deleteMany({ userId });
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export interface WatchlistEntry {
  id: number;
  title: string;
  coverImage: string;
  episodes: number | null;
  status: string;
  averageScore: number | null;
  genres: string[];
  addedAt: string;
}

async function getWatchlistCollection() {
  const client = await getMongoClient();
  const col = client.db(DB_NAME).collection<WatchlistEntry & { userId: string }>("watchlist");
  await col.createIndex({ userId: 1, id: 1 }, { unique: true });
  return col;
}

export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const col = await getWatchlistCollection();
  return col
    .find({ userId }, { projection: { _id: 0, userId: 0 } })
    .sort({ addedAt: -1 })
    .toArray();
}

export async function upsertWatchlistItem(userId: string, item: WatchlistEntry): Promise<void> {
  const col = await getWatchlistCollection();
  await col.updateOne(
    { userId, id: item.id },
    { $set: { ...item, userId } },
    { upsert: true }
  );
}

export async function removeWatchlistItem(userId: string, itemId: number): Promise<void> {
  const col = await getWatchlistCollection();
  await col.deleteOne({ userId, id: itemId });
}

export async function clearWatchlist(userId: string): Promise<void> {
  const col = await getWatchlistCollection();
  await col.deleteMany({ userId });
}


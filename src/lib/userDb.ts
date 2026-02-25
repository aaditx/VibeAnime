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
  // Profile customization
  avatarId?: string;       // e.g. "avatar-1" … "avatar-10"
  displayName?: string;    // optional override, max 30 chars
  bio?: string;            // max 160 chars
  bannerColor?: string;    // CSS hex for profile hero accent
  // Gamification
  loginStreak?: number;    // consecutive days logged in
  lastActiveDate?: string; // ISO date string (YYYY-MM-DD) of last login
  totalPoints?: number;    // cached total points for leaderboard queries
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

// ─── Watch Stats (for badges/points) ─────────────────────────────────────────

export interface UserWatchStats {
  uniqueAnimeWatched: number;
  totalEpisodesWatched: number;
}

export async function getUserWatchStats(userId: string): Promise<UserWatchStats> {
  const col = await getProgressCollection();

  // Each document = one unique anime (index enforces userId+animeId uniqueness)
  const docs = await col
    .find({ userId }, { projection: { episode: 1 } })
    .toArray();

  const uniqueAnimeWatched = docs.length;
  // Sum of the highest episode number reached per anime as a proxy for episodes watched
  const totalEpisodesWatched = docs.reduce((sum, d) => sum + (d.episode ?? 0), 0);

  return { uniqueAnimeWatched, totalEpisodesWatched };
}

// ─── Profile Customization ────────────────────────────────────────────────────

export interface UserProfile {
  avatarId?: string;
  displayName?: string;
  bio?: string;
  bannerColor?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const col = await getCollection();
  const user = await col.findOne(
    { id: userId },
    { projection: { _id: 0, avatarId: 1, displayName: 1, bio: 1, bannerColor: 1 } }
  );
  if (!user) return {};
  return {
    avatarId: user.avatarId,
    displayName: user.displayName,
    bio: user.bio,
    bannerColor: user.bannerColor,
  };
}

export async function updateUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const col = await getCollection();
  const update: Partial<User> = {};
  if (profile.avatarId !== undefined) update.avatarId = profile.avatarId;
  if (profile.displayName !== undefined) update.displayName = profile.displayName.slice(0, 30);
  if (profile.bio !== undefined) update.bio = profile.bio.slice(0, 160);
  if (profile.bannerColor !== undefined) update.bannerColor = profile.bannerColor;
  await col.updateOne({ id: userId }, { $set: update });
}

// ─── Streak Tracking ────────────────────────────────────────────────────────────

export interface UserStreak {
  loginStreak: number;
  lastActiveDate: string;
}

// Returns updated streak. Call this once per day per user (idempotent).
export async function updateUserStreak(userId: string): Promise<UserStreak> {
  const col = await getCollection();
  const user = await col.findOne({ id: userId }, { projection: { loginStreak: 1, lastActiveDate: 1 } });

  const todayISO = new Date().toISOString().slice(0, 10); // e.g. "2026-02-25"
  const lastDate = user?.lastActiveDate ?? "";

  if (lastDate === todayISO) {
    // Already recorded today — no change
    return { loginStreak: user?.loginStreak ?? 1, lastActiveDate: todayISO };
  }

  // Check if yesterday was the last active day (streak continues)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  const currentStreak = user?.loginStreak ?? 0;
  const newStreak = lastDate === yesterdayISO ? currentStreak + 1 : 1;

  await col.updateOne(
    { id: userId },
    { $set: { loginStreak: newStreak, lastActiveDate: todayISO } }
  );

  return { loginStreak: newStreak, lastActiveDate: todayISO };
}

export async function getUserStreak(userId: string): Promise<UserStreak> {
  const col = await getCollection();
  const user = await col.findOne(
    { id: userId },
    { projection: { loginStreak: 1, lastActiveDate: 1 } }
  );
  return {
    loginStreak: user?.loginStreak ?? 0,
    lastActiveDate: user?.lastActiveDate ?? "",
  };
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  displayName?: string;
  avatarId?: string;
  totalPoints: number;
  loginStreak: number;
  uniqueAnimeWatched: number;
  highestBadgeId: string | null;
}

export async function saveTotalPoints(userId: string, points: number): Promise<void> {
  const col = await getCollection();
  await col.updateOne({ id: userId }, { $set: { totalPoints: points } });
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const col = await getCollection();

  // Get top users by cached totalPoints
  const users = await col
    .find(
      { totalPoints: { $gt: 0 } },
      {
        projection: {
          _id: 0, id: 1, name: 1, displayName: 1, avatarId: 1,
          totalPoints: 1, loginStreak: 1,
        },
      }
    )
    .sort({ totalPoints: -1 })
    .limit(limit)
    .toArray();

  // Fetch anime watch counts for all these users in one query
  const client = await getMongoClient();
  const wpCol = client.db(DB_NAME).collection<{ userId: string; animeId: string }>("watchProgress");

  const userIds = users.map((u) => u.id);
  const animeCounts = await wpCol
    .aggregate<{ _id: string; count: number }>([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ])
    .toArray();

  const animeCountMap = new Map(animeCounts.map((a) => [a._id, a.count]));

  // Import badge tiers here to avoid circular dep — use dynamic require pattern
  const { BADGE_TIERS } = await import("@/lib/badges");

  return users.map((user, i) => {
    const uniqueAnimeWatched = animeCountMap.get(user.id) ?? 0;
    const earned = BADGE_TIERS.filter((b) => uniqueAnimeWatched >= b.threshold);
    const highestBadgeId = earned.length > 0 ? earned[earned.length - 1].id : null;

    return {
      rank: i + 1,
      userId: user.id,
      name: user.name,
      displayName: user.displayName,
      avatarId: user.avatarId,
      totalPoints: user.totalPoints ?? 0,
      loginStreak: user.loginStreak ?? 0,
      uniqueAnimeWatched,
      highestBadgeId,
    };
  });
}

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


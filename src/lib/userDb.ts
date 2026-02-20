import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "data", "users.json");

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

// In-memory cache — avoids re-reading the file on every request.
// null means "not loaded yet"; [] means "empty file".
let usersCache: User[] | null = null;

function readFromDisk(): User[] {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as User[];
  } catch {
    return [];
  }
}

function writeToDisk(users: User[]): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
  usersCache = users; // keep cache in sync
}

async function ensureDb(): Promise<User[]> {
  if (usersCache !== null) return usersCache;

  if (!fs.existsSync(DB_PATH)) {
    // Seed a demo user using async hash — does not block the event loop
    const demoHash = await bcrypt.hash("demo123", 10);
    const users: User[] = [
      {
        id: "demo-user-1",
        name: "Demo User",
        email: "demo@vibeanime.com",
        passwordHash: demoHash,
        createdAt: new Date().toISOString(),
      },
    ];
    writeToDisk(users);
    return users;
  }

  usersCache = readFromDisk();
  return usersCache;
}

export async function getUsers(): Promise<User[]> {
  return ensureDb();
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await ensureDb();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const users = await ensureDb();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("User already exists");
  }
  // Async hash — non-blocking
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  const updated = [...users, newUser];
  writeToDisk(updated);
  return newUser;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


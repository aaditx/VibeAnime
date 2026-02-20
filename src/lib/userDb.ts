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

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    // Seed a demo user
    const demoHash = bcrypt.hashSync("demo123", 10);
    const users: User[] = [
      {
        id: "demo-user-1",
        name: "Demo User",
        email: "demo@vibeanime.com",
        passwordHash: demoHash,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
  }
}

export function getUsers(): User[] {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(name: string, email: string, password: string): User {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("User already exists");
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
  return newUser;
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

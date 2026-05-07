import bcrypt from "bcryptjs";
import { env } from "../config/env";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

export function assertStrongPassword(password: string): void {
  if (!strongPasswordRegex.test(password)) {
    throw new Error(
      "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol",
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcryptSaltRounds);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}


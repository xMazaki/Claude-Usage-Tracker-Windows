import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getStoragePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'data');
}

function getKeyPath(): string {
  return path.join(getStoragePath(), '.key');
}

function ensureDir(): void {
  const dir = getStoragePath();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getOrCreateKey(): Buffer {
  const keyPath = getKeyPath();
  ensureDir();
  if (fs.existsSync(keyPath)) {
    return Buffer.from(fs.readFileSync(keyPath, 'utf-8'), 'hex');
  }
  const key = crypto.randomBytes(KEY_LENGTH);
  fs.writeFileSync(keyPath, key.toString('hex'), { encoding: 'utf-8' });
  return key;
}

export function encrypt(text: string): string {
  const key = getOrCreateKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

export function decrypt(data: string): string {
  const key = getOrCreateKey();
  const parts = data.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function saveData(filename: string, data: any): void {
  ensureDir();
  const filePath = path.join(getStoragePath(), filename);
  const json = JSON.stringify(data, null, 2);
  const encrypted = encrypt(json);
  fs.writeFileSync(filePath, encrypted, 'utf-8');
}

export function loadData<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(getStoragePath(), filename);
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    const encrypted = fs.readFileSync(filePath, 'utf-8');
    const json = decrypt(encrypted);
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

export function savePlain(filename: string, data: any): void {
  ensureDir();
  const filePath = path.join(getStoragePath(), filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function loadPlain<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(getStoragePath(), filename);
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return defaultValue;
  }
}

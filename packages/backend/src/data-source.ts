import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const baseDir = isProd ? path.resolve('dist') : path.resolve('src');

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE === 'sqljs' ? 'sqljs' : 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'db_workspace',
  entities: [path.join(baseDir, '**', '*.entity{.ts,.js}')],
  migrations: [path.join(baseDir, 'migrations', '*.{ts,js}')],
  synchronize: false,
  ...(process.env.DB_TYPE === 'sqljs' ? { autoSave: true, location: path.resolve('data/db.sqlite') } : {}),
} as any);

export default AppDataSource;

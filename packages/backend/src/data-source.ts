import { DataSource } from 'typeorm';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const baseDir = isProd ? path.resolve('dist') : path.resolve('src');

const AppDataSource = new DataSource({
  type: isProd ? 'mysql' : 'sqljs',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  entities: [path.join(baseDir, '**', '*.entity{.ts,.js}')],
  migrations: [path.join(baseDir, 'migrations', '*.{ts,js}')],
  synchronize: false,
  ...(isProd ? {} : { autoSave: true, location: path.resolve('data/db.sqlite') }),
} as any);

export default AppDataSource;

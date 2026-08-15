import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { UserEntity } from '../src/users/infrastructure/user.entity';
import { Company } from '../src/companies/company.entity';
import { createUser, UserAlreadyExistsError } from '../src/users/create-user.helper';

export function buildDataSource(): DataSource {
  const isSqljs = process.env.DB_TYPE === 'sqljs';

  return new DataSource(
    isSqljs
      ? {
          type: 'sqljs',
          autoSave: true,
          location: path.resolve('data/db.sqlite'),
          entities: [UserEntity, Company],
          synchronize: false,
        }
      : {
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 3306,
          username: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || 'admin',
          database: process.env.DB_NAME || 'db_workspace',
          entities: [UserEntity, Company],
          synchronize: false,
        },
  );
}

export async function runCreateUser(dataSource: DataSource, args: string[]): Promise<string> {
  if (args.length < 3) {
    throw new Error('Uso: npx ts-node scripts/create-user.ts <nome> <email> <senha>');
  }

  const [name, email, password] = args;
  const userRepository = dataSource.getRepository(UserEntity);
  const user = await createUser(userRepository, name, email, password);
  return `Usuário "${user.name}" (${user.email}) criado com sucesso!`;
}

export async function main() {
  if (process.argv.length < 5) {
    console.error('Uso: npx ts-node scripts/create-user.ts <nome> <email> <senha>');
    process.exit(1);
  }

  const dataSource = buildDataSource();
  try {
    await dataSource.initialize();
    const message = await runCreateUser(dataSource, process.argv.slice(2));
    console.log(message);
  } catch (err: any) {
    if (err instanceof UserAlreadyExistsError) {
      console.error('Erro: Já existe um usuário com este email.');
    } else {
      console.error(`Erro ao criar usuário: ${err.message}`);
    }
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  main();
}

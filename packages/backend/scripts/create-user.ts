import { DataSource } from 'typeorm';
import * as path from 'path';
import { User } from '../src/users/user.entity';
import { createUser, UserAlreadyExistsError } from '../src/users/create-user.helper';

const isSqljs = process.env.DB_TYPE === 'sqljs';

const dataSource = new DataSource(
  isSqljs
    ? {
        type: 'sqljs',
        autoSave: true,
        location: path.resolve('data/db.sqlite'),
        entities: [User],
        synchronize: false,
      }
    : {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'db_workspace',
        entities: [User],
        synchronize: false,
      },
);

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Uso: npx ts-node scripts/create-user.ts <nome> <email> <senha>');
    process.exit(1);
  }

  const [name, email, password] = args;

  await dataSource.initialize();
  try {
    const userRepository = dataSource.getRepository(User);
    const user = await createUser(userRepository, name, email, password);
    console.log(`Usuário "${user.name}" (${user.email}) criado com sucesso!`);
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

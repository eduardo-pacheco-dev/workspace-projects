import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { User } from '../src/users/user.entity';

const isProd = process.env.NODE_ENV === 'production';

const dataSource = new DataSource(
  isProd
    ? {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'myapp',
        entities: [User],
        synchronize: false,
      }
    : {
        type: 'sqljs',
        autoSave: true,
        location: path.resolve('data/db.sqlite'),
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
  const userRepository = dataSource.getRepository(User);

  const existing = await userRepository.findOne({ where: { email } });
  if (existing) {
    console.error('Erro: Já existe um usuário com este email.');
    await dataSource.destroy();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepository.create({ name, email, password: hashedPassword });
  await userRepository.save(user);

  console.log(`Usuário "${name}" (${email}) criado com sucesso!`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Erro ao criar usuário:', err.message);
  process.exit(1);
});

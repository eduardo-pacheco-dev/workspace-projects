import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export class UserAlreadyExistsError extends Error {}

export async function createUser(
  userRepository: Repository<User>,
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const existing = await userRepository.findOne({ where: { email } });
  if (existing) {
    throw new UserAlreadyExistsError('Já existe um usuário com este email.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepository.create({
    name,
    email,
    password: hashedPassword,
    role: 'master',
    companyId: null,
  });
  return userRepository.save(user);
}

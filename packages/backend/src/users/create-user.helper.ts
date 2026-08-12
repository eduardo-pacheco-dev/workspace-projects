import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from './infrastructure/user.entity';

export class UserAlreadyExistsError extends Error {}

export async function createUser(
  userRepository: Repository<UserEntity>,
  name: string,
  email: string,
  password: string,
): Promise<UserEntity> {
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
    status: 'active',
  });
  return userRepository.save(user);
}

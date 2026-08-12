import { User, UserProps } from './user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface CurrentUser {
  id: number;
  role: string;
  companyId: number | null;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  companyId?: number;
  isMasterUser?: boolean;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  create(user: User): Promise<User>;
  save(user: User): Promise<User>;
  update(id: number, data: Partial<UserProps>): Promise<void>;
  findAll(query: UserQuery): Promise<PaginatedUsers>;
  delete(id: number): Promise<boolean>;
  companyExists(companyId: number): Promise<boolean>;
}

import { User } from '@/app/entities/user';

export abstract class UserRepository {
  public abstract create(user: User): Promise<User>;
  public abstract findByLogin(userLogin: string): Promise<User | null>;
  public abstract findById(userId: string): Promise<User | null>;
}

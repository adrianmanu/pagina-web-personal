import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { toPublicUser, type PublicUser, type User } from '../models/user';
import type { UserRepository } from '../repositories/types';
import { ApiError } from '../middleware/errorHandler';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(input: { email?: string; password?: string; fullName?: string }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';
    const fullName = input.fullName?.trim() ?? '';

    if (!EMAIL_REGEX.test(email)) throw new ApiError(400, 'Correo electrónico inválido');
    if (password.length < 8) throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres');
    if (fullName.length < 3) throw new ApiError(400, 'El nombre debe tener al menos 3 caracteres');

    if (await this.users.findByEmail(email)) {
      throw new ApiError(409, 'Ya existe una cuenta con ese correo');
    }

    const user: User = {
      id: randomUUID(),
      email,
      fullName,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };
    await this.users.create(user);

    return { accessToken: this.signToken(user), user: toPublicUser(user) };
  }

  async login(input: { email?: string; password?: string }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(input.password ?? '', user.passwordHash))) {
      throw new ApiError(401, 'Credenciales incorrectas');
    }
    return { accessToken: this.signToken(user), user: toPublicUser(user) };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new ApiError(401, 'Usuario no encontrado');
    return toPublicUser(user);
  }

  private signToken(user: User): string {
    return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
      expiresIn: `${env.jwtExpiresInHours}h`,
    });
  }
}

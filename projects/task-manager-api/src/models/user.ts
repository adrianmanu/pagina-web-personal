export interface User {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, fullName: user.fullName };
}

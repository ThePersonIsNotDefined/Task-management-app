export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

export interface RegistrationInput {
  email: string;
  displayName: string;
  password: string;
}
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  companyName: string
  cnpj?: string
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    avatarUrl?: string
  }
  companyId: string
  accessToken: string
  expiresAt: number
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
  confirmPassword: string
}

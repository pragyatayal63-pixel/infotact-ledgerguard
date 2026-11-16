export interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFormErrors = Partial<Record<'email' | 'password', string>>

export type LoginFieldName = keyof LoginFormErrors

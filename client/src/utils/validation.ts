import type { LoginFieldName, LoginFormErrors, LoginFormValues } from '../types/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateField(
  field: LoginFieldName,
  values: LoginFormValues,
): string | undefined {
  if (field === 'email') {
    const email = values.email.trim()
    if (!email) return 'Enter your email address.'
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, like name@company.com.'
    return undefined
  }

  if (!values.password) return 'Enter your password.'
  return undefined
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}
  const fields: LoginFieldName[] = ['email', 'password']

  for (const field of fields) {
    const message = validateField(field, values)
    if (message) errors[field] = message
  }

  return errors
}

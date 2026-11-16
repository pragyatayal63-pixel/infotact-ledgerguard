import { useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { FormField } from '../components/FormField'
import { Logo } from '../components/Logo'
import { PasswordField } from '../components/PasswordField'
import type { LoginFieldName, LoginFormErrors, LoginFormValues } from '../types/auth'
import { validateField, validateLoginForm } from '../utils/validation'
import './LoginPage.css'

const INITIAL_VALUES: LoginFormValues = { email: '', password: '', rememberMe: false }
const CURRENT_YEAR = new Date().getFullYear()

export function LoginPage() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [passedValidation, setPassedValidation] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target
    const next = { ...values, [name]: type === 'checkbox' ? checked : value }
    setValues(next)
    setPassedValidation(false)

    // Once a field shows an error, re-check it as the user types so the message clears.
    if (name === 'email' || name === 'password') {
      if (errors[name]) {
        setErrors((current) => ({ ...current, [name]: validateField(name, next) }))
      }
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const name = event.target.name as LoginFieldName
    setErrors((current) => ({ ...current, [name]: validateField(name, values) }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateLoginForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setPassedValidation(false)
      const firstInvalid: LoginFieldName = nextErrors.email ? 'email' : 'password'
      document.getElementById(firstInvalid)?.focus()
      return
    }

    // UI only: authentication is not connected yet.
    setPassedValidation(true)
  }

  return (
    <main className="login">
      <div className="login__shell">
        <header className="brand">
          <Logo className="brand__logo" />
          <div>
            <h1 className="brand__name">LedgerGuard</h1>
            <p className="brand__tagline">Secure Billing Management</p>
          </div>
        </header>

        <section className="card" aria-labelledby="login-heading">
          <h2 id="login-heading" className="card__title">Welcome Back</h2>
          <p className="card__description">Sign in to access your organization dashboard.</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <FormField
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="name@company.com"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={values.password}
              error={errors.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <div className="form__row">
              <label className="check">
                <input
                  className="check__input"
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <a className="link" href="#forgot-password" onClick={(event) => event.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button className="button" type="submit">Sign In</button>

            {passedValidation && (
              <p className="notice" role="status">
                Your details look valid. Sign-in isn&rsquo;t connected yet, so nothing was sent.
              </p>
            )}
          </form>
        </section>

        <footer className="login__footer">&copy; {CURRENT_YEAR} LedgerGuard</footer>
      </div>
    </main>
  )
}

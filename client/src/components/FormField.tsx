import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  /** Optional element rendered inside the input on the right (e.g. a toggle button). */
  trailing?: ReactNode
}

export function FormField({ id, label, error, trailing, className, ...inputProps }: FormFieldProps) {
  const errorId = `${id}-error`
  const inputClass = ['field__input', trailing ? 'field__input--with-trailing' : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          className={inputClass}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = "", ...props }, ref) => {
    return (
      <div className="field">
        <input
          ref={ref}
          className={`input-minimal ${error ? "input-invalid" : ""} ${className}`}
          placeholder=" "
          {...props}
        />
        {label && <label>{label}</label>}
        {error && <p className="helper-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";


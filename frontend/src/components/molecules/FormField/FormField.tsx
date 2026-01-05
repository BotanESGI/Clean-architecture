import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { Input } from "../../atoms/Input";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export function FormField({ label, error, ...props }: FormFieldProps) {
  return (
    <Input
      label={label}
      error={error?.message}
      {...props}
    />
  );
}


import { ReactNode } from "react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  children: ReactNode;
  className?: string;
}

export function Alert({ type = "info", children, className = "" }: AlertProps) {
  const typeClasses = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info"
  };

  return (
    <div className={`alert ${typeClasses[type]} ${className}`}>
      {children}
    </div>
  );
}


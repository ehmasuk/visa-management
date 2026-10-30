import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Shared server-component building blocks for admin/staff/agency pages.
 * Controls delegate to the shadcn primitives (components/ui/*); the thin
 * wrappers here keep the compact props (labelled fields, option arrays,
 * primary/ghost/danger submit variants) consumed by the plain
 * <form action={serverAction}> posts used across the app.
 */

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </main>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required = true,
  narrow,
  multiline = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  narrow?: boolean;
  multiline?: boolean;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground/80">{label}</span>
      {multiline ? (
        <Textarea
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className={`rounded-xl border-border/80 text-xs ${narrow ? "w-56 max-w-none" : ""}`}
        />
      ) : (
        <Input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className={`rounded-xl border-border/80 text-xs h-9.5 ${narrow ? "w-56 max-w-none" : ""}`}
        />
      )}
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground/80">{label}</span>
      <NativeSelect name={name} defaultValue={defaultValue} className="w-full rounded-xl border-border/80 text-xs h-9.5">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
}) {
  const buttonVariant =
    variant === "ghost" ? "outline" : variant === "danger" ? "destructive" : "default";
  return (
    <Button
      type="submit"
      variant={buttonVariant}
      className="rounded-xl px-4 py-2 font-semibold text-xs cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
    >
      {children}
    </Button>
  );
}

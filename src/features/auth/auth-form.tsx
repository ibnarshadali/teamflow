"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import type { AuthFormState } from "@/features/auth/actions";
import { forgotPasswordAction, loginAction, registerAction } from "@/features/auth/actions";

type Mode = "login" | "register" | "forgot";

const copy = {
  login: {
    title: "Log in to TeamFlow",
    description: "Open your workspace and continue your team’s work.",
    cta: "Log in",
  },
  register: {
    title: "Create your TeamFlow account",
    description: "Start with one workspace for your software team.",
    cta: "Create account",
  },
  forgot: {
    title: "Reset your password",
    description: "Enter your email and TeamFlow will send a reset link.",
    cta: "Send reset link",
  },
};

const actions = {
  login: loginAction,
  register: registerAction,
  forgot: forgotPasswordAction,
};

export function AuthForm({ mode }: { mode: Mode }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(actions[mode], {});

  return (
    <div className="w-full max-w-md rounded-md border bg-card p-6 shadow-sm">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">TF</span>
          <div>
            <p className="font-semibold">TeamFlow</p>
            <p className="text-xs text-muted-foreground">Small-team project management</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-normal">{copy[mode].title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy[mode].description}</p>
      </div>

      <form action={action} className="mt-6 space-y-4">
        {mode === "register" ? (
          <Field label="Name" name="name" errors={state.errors?.name}>
            <Input id="name" name="name" autoComplete="name" placeholder="Ava Khan" />
          </Field>
        ) : null}
        <Field label="Email" name="email" errors={state.errors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
        </Field>
        {mode !== "forgot" ? (
          <Field label="Password" name="password" errors={state.errors?.password}>
            <PasswordInput id="password" name="password" placeholder="Minimum 8 characters" />
          </Field>
        ) : null}
        {state.message ? (
          <p className="rounded-md border border-warning/30 bg-orange-50 p-3 text-sm text-warning dark:bg-orange-950/30" role="status">
            {state.message}
          </p>
        ) : null}
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? "Working..." : copy[mode].cta}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-muted-foreground">
        {mode !== "login" ? <Link className="hover:text-foreground" href="/login">Back to login</Link> : null}
        {mode !== "register" ? <Link className="hover:text-foreground" href="/register">Create account</Link> : null}
        {mode === "login" ? <Link className="hover:text-foreground" href="/forgot-password">Forgot password?</Link> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      {children}
      {errors?.map((error) => (
        <p className="text-sm text-destructive" key={error}>
          {error}
        </p>
      ))}
    </div>
  );
}

"use client";

import LoginForm from "../../../features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/*  Header  */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please enter your details to sign in
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="/register" className="font-medium text-accent hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

import RegisterForm from "../../../features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/*  Header  */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Join your team's workspace
        </p>
      </div>

      <RegisterForm />

      {/*  Divider  */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/*  OAuth buttons  */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex w-full items-center justify-center rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foregroundhover:bg-muted/70 transition-colors">
          Google
        </button>
        <button className="flex w-full items-center justify-center rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/70 transition-colors">
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

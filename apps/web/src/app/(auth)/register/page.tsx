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
          Get started with your workspace
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

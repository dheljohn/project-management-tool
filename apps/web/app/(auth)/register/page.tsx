"use client";

import { useState, FormEvent, ChangeEvent, JSX } from "react";

interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export default function RegisterPage(): JSX.Element {
  const [user_id, setUser_id] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    // 1. Log the initiation and payload being sent
    console.log("🚀 [Registration] Starting submission...");
    console.log("📦 [Registration] Payload data:", {
      user_id,
      email,
      password: "🏼🔒 (Hidden for security)",
    });

    try {
      const response = await fetch(
        "http://localhost:8000/test01/create_member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, email, password }),
        },
      );

      // 2. Log the raw response parameters
      console.log(
        `📡 [Registration] Response received. Status: ${response.status} (${response.statusText})`,
      );

      const data: ApiErrorResponse & Record<string, any> =
        await response.json();

      // 3. Log the response payload body from the server
      console.log("📥 [Registration] Response data body:", data);

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
        throw new Error(errorMessage || "Registration failed");
      }

      console.log("✅ [Registration] Account created successfully!");
      setMessage("Registration successful!");
      setUser_id("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      // 4. Log details about structural network or validation errors
      console.error("❌ [Registration] Caught operational exception:");

      if (err instanceof Error) {
        console.error(`💥 Error Message: ${err.message}`);
        setError(err.message);
      } else {
        console.error("💥 Unknown Error Object:", err);
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      console.log("🏁 [Registration] Execution context closed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Create an Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <input
                type="text"
                value={user_id}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUser_id(e.target.value)
                }
                required
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-3 text-center text-sm font-medium text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-center text-sm font-medium text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

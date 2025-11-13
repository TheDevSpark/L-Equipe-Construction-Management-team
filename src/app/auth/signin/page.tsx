"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClinet";

export default function SigninPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("In sign in");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else router.push("/dashboard/team");
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">
        {/* Logo / Icon */}
    
        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold mb-2 text-black">
          Welcome back
        </h2>
        <p className="text-center text-black mb-6">
          Sign in 
        </p>

        {/* Form */}
        <form onSubmit={handleSignin} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 text-black focus:ring-indigo-500"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <div className="text-right text-sm mt-1">
              <a href="#" className="text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

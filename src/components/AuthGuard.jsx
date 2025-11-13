"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles = [],
}) {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || profileLoading) return;

    if (requireAuth && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user && !profile && !profileLoading) {
      // User is authenticated but no profile exists and we're not currently creating one
      console.log(
        "User authenticated but no profile found - this should be handled by AuthContext"
      );
    }

    if (
      requireAuth &&
      profile &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(profile.role)
    ) {
      // User doesn't have required role
      router.push("/dashboard/team"); // Redirect to default dashboard
      return;
    }
  }, [
    user,
    profile,
    loading,
    profileLoading,
    requireAuth,
    allowedRoles,
    router,
  ]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          {profileLoading && (
            <p className="mt-4 text-gray-600">Setting up your profile...</p>
          )}
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect to login
  }

  if (
    requireAuth &&
    profile &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(profile.role)
  ) {
    return null; // Will redirect to appropriate dashboard
  }

  return children;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
];

// Routes that require authentication but not full verification
const AUTH_ONLY_ROUTES = [
  "/verify/role-select",
  "/verify/student-email",
  "/verify/alumni-request",
  "/verify/recruiter-request",
  "/verify/pending",
  "/profile/complete",
];

export default function UserFlowGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile: userDoc, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route)
    );

    // Check if current route only needs authentication
    const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    // SECURITY: If not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
      console.log("Unauthorized access attempt - redirecting to login");
      router.push("/login");
      setIsChecking(false);
      return;
    }
    return '/home';
  };

  if (!user) {
    // Allow public paths without user
    if (publicPaths.includes(pathname)) {
      return <>{children}</>;
    }
    // Redirect unauthenticated users trying to access protected pages
    router.push('/login');
    return null;
  }

    // Now enforce the flow for authenticated users
    if (user && userDoc) {
      // Step 1: Check if role is selected
      if (!userDoc.role || userDoc.role === "student") {
        if (!pathname.startsWith("/verify/role-select")) {
          console.log("No role selected - redirecting to role selection");
          router.push("/verify/role-select");
          setIsChecking(false);
          return;
        }
      }

      // Step 2: Check verification status
      if (userDoc.verificationStatus !== "verified") {
        // If student and unverified, send to email verification
        if (userDoc.role === "student" && userDoc.verificationStatus === "unverified") {
          if (!pathname.startsWith("/verify/student-email")) {
            console.log("Student needs email verification");
            router.push("/verify/student-email");
            setIsChecking(false);
            return;
          }
        }

        // If alumni/recruiter and pending, show pending page
        if (
          (userDoc.role === "expert" || userDoc.role === "recruiter") &&
          userDoc.verificationStatus === "pending"
        ) {
          if (!pathname.startsWith("/verify/pending")) {
            console.log("Verification pending - showing waiting page");
            router.push("/verify/pending");
            setIsChecking(false);
            return;
          }
        }

        // If alumni/recruiter and unverified, send to request form
        if (
          (userDoc.role === "expert" || userDoc.role === "recruiter") &&
          userDoc.verificationStatus === "unverified"
        ) {
          const requestPath =
            userDoc.role === "expert"
              ? "/verify/alumni-request"
              : "/verify/recruiter-request";
          
          if (!pathname.startsWith(requestPath)) {
            console.log(`Redirecting to ${requestPath}`);
            router.push(requestPath);
            setIsChecking(false);
            return;
          }
        }

        // If rejected, send back to role selection to try again
        if (userDoc.verificationStatus === "rejected") {
          if (!pathname.startsWith("/verify/role-select")) {
            console.log("Verification rejected - back to role selection");
            router.push("/verify/role-select");
            setIsChecking(false);
            return;
          }
        }
      }

      // Step 3: Check profile completion (only for verified users)
      if (
        userDoc.verificationStatus === "verified" &&
        !userDoc.profileCompleted
      ) {
        if (!pathname.startsWith("/profile/complete")) {
          console.log("Profile incomplete - redirecting to completion");
          router.push("/profile/complete");
          setIsChecking(false);
          return;
        }
      }

      // Step 4: If everything is complete but still on verification pages, redirect to home
      if (
        userDoc.verificationStatus === "verified" &&
        userDoc.profileCompleted &&
        (pathname.startsWith("/verify/") || pathname.startsWith("/profile/complete"))
      ) {
        console.log("Flow complete - redirecting to home");
        router.push("/home");
        setIsChecking(false);
        return;
      }
    }

    // If we made it here, user can access the current route
    setIsChecking(false);
  }, [user, userDoc, loading, pathname, router]);

  // Show loading state while checking
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
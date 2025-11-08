"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup" | "verify";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  // Clerk  hooks
  const {
    isLoaded: signInLoaded,
    signIn,
    setActive: setActiveFromSignIn,
  } = useSignIn();
  const {
    isLoaded: signUpLoaded,
    signUp,
    setActive: setActiveFromSignUp,
  } = useSignUp();

  // UI state
  const [mode, setMode] = useState<Mode>("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ready = signInLoaded && signUpLoaded;

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await signIn!.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActiveFromSignIn!({ session: res.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Additional verification required.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp!.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verify");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await signUp!.attemptEmailAddressVerification({
        code: verifyCode,
      });
      if (res.status === "complete") {
        await setActiveFromSignUp!({ session: res.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification not complete.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Invalid code");
    } finally {
      setSubmitting(false);
    }
  }

  async function startOAuth(strategy: OAuthStrategy) {
    if (!ready || !signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "OAuth failed");
    }
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p className="text-muted-foreground text-sm">
          Loading authentication...
        </p>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={
          mode === "signin" ? onSignIn : mode === "signup" ? onSignUp : onVerify
        }
      >
        <FieldGroup>
          <div
            className={`flex flex-col items-center gap-2 text-center ${
              mode === "signup" ? "mt-14" : ""
            }`}
          >
            <h1 className="text-xl font-bold">Welcome</h1>
            <FieldDescription>
              {mode === "signup" ? (
                <div className="flex flex-row gap-2">
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              ) : (
                <div className="flex flex-row gap-2">
                  Don&apos;t have an account?
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </FieldDescription>
          </div>

          {error && <p className="text-sm text-red-600 px-1">{error}</p>}

          {mode === "signup" && (
            <div className="space-y-4">
              <div className="flex flex-row gap-2">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter First Name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Surname</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter Surname"
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Please wait..." : "Create account"}
                </Button>
              </Field>
            </div>
          )}

          {mode === "signin" && (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Signing in..." : "Login"}
                </Button>
              </Field>
            </div>
          )}

          {mode === "verify" && (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="code">Verification code</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Verifying..." : "Verify & continue"}
                </Button>
              </Field>
              <FieldDescription className="px-1">
                We sent a code to <b>{email}</b>. Check your inbox (and spam).
              </FieldDescription>
            </div>
          )}

          <FieldSeparator>Or</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => startOAuth("oauth_apple" as OAuthStrategy)}
            >
              Continue with Apple
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startOAuth("oauth_google" as OAuthStrategy)}
            >
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

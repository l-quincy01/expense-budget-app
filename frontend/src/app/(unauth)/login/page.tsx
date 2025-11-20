"use client";
import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <div className="bg-background flex  flex-col items-center justify-center  p-6 ">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

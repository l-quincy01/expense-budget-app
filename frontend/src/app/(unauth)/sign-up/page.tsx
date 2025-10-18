import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 mt-20">
      <div className="w-full max-w-sm ">
        {/* <LoginForm /> */}
        <SignUp />
      </div>
    </div>
  );
}

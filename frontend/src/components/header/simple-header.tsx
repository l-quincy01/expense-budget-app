import React from "react";
import { Grid2x2PlusIcon } from "lucide-react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggle } from "@/components/ui/menu-toggle";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  useClerk,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const { signOut } = useClerk();
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const links = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ];

  return (
    <header className="fixed top-4 z-50 w-full  backdrop-blur-lg">
      <nav className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
        <Link href={"/"} className="flex items-center gap-2 cursor-pointer">
          <p className=" text-lg font-bold">Budgetly-AI</p>
        </Link>
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link, i) => (
            <Link
              key={i}
              className={buttonVariants({ variant: "ghost" })}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          {/* <Link href={"/login"}>Login</Link>
          <Link href={"/sign-up"}>Sign Up</Link> */}
          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => signOut({ redirectUrl: "/login" })}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.assign("/login")}>
                Get Started
              </Button>
            )}
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <Button size="icon" variant="outline" className="lg:hidden">
            <MenuToggle
              strokeWidth={2.5}
              open={open}
              onOpenChange={setOpen}
              className="size-6"
            />
          </Button>
          <SheetContent
            className="95 supports-[backdrop-filter]:80 gap-0 backdrop-blur-lg"
            showClose={false}
            side="left"
          >
            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
              {links.map((link, i) => (
                <a
                  key={i}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "justify-start",
                  })}
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <SheetFooter>
              {/* <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <a href="/login">Sign in</a>
              </SignedOut> */}
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

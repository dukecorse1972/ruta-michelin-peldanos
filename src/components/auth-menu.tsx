"use client";

import { useSyncExternalStore } from "react";
import { LogIn, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import type { Profile } from "@/lib/types";

export function AuthMenu({ profile }: { profile: Profile | null }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    if (!profile) {
      return (
        <Button asChild>
          <Link href="/login">
            <LogIn className="size-4" />
            Entrar
          </Link>
        </Button>
      );
    }

    return (
      <Button variant="outline" suppressHydrationWarning>
        <User className="size-4" />
        <span className="hidden max-w-40 truncate sm:inline">
          {profile.display_name ?? profile.email}
        </span>
        <span className="sm:hidden">Cuenta</span>
      </Button>
    );
  }

  return <UserMenu profile={profile} />;
}

import Link from "next/link";
import { LogIn, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Profile } from "@/lib/types";
import { LogoutMenuItem } from "@/components/logout-menu-item";

export function UserMenu({ profile }: { profile: Profile | null }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="size-4" />
          <span className="hidden max-w-40 truncate sm:inline">
            {profile.display_name ?? profile.email}
          </span>
          <span className="sm:hidden">Cuenta</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {profile.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 size-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

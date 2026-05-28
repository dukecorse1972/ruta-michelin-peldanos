import Link from "next/link";
import { Shield, Utensils } from "lucide-react";
import { AuthMenu } from "@/components/auth-menu";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export function SiteHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-[2000] border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Utensils className="size-4" />
          </span>
          <span className="hidden sm:inline">La ruta Michelin de Peldaños</span>
          <span className="sm:hidden">Peldaños</span>
        </Link>
        <div className="flex items-center gap-2">
          {profile?.role === "admin" ? (
            <Button asChild className="hidden sm:inline-flex" variant="outline">
              <Link href="/admin">
                <Shield className="size-4" />
                Admin
              </Link>
            </Button>
          ) : null}
          <AuthMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}

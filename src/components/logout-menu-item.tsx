"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutMenuItem() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted focus:bg-muted"
    >
      <LogOut className="mr-2 size-4" />
      Salir
    </button>
  );
}

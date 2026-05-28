import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">Admin</p>
          <h1 className="text-3xl font-black tracking-tight">
            Control de la ruta
          </h1>
        </div>
        <nav className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">Mapa</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/restaurants">Restaurantes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/videos">Vídeos</Link>
          </Button>
        </nav>
      </div>
      {children}
    </main>
  );
}

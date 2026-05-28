import Link from "next/link";
import { LoginButton } from "@/components/login-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-sm font-bold text-primary">Zona fan con llave</p>
          <h1 className="mt-3 text-3xl font-black">Entrar en Peldaños Michelin</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            El login prepara perfiles y roles. Para el primer admin, cambia el
            campo `role` a `admin` en Supabase.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <LoginButton />
            <Button asChild variant="ghost">
              <Link href="/">Volver al mapa</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

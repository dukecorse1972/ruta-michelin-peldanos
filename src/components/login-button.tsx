import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/app/login/actions";

export function LoginButton() {
  return (
    <form action={loginWithGoogle}>
      <Button type="submit">
        <LogIn className="size-4" />
        Entrar con Google
      </Button>
    </form>
  );
}

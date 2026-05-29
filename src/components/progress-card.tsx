import { CheckCircle2, Sparkles, TimerReset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";
import type { Restaurant } from "@/lib/types";

export function ProgressCard({ restaurants }: { restaurants: Restaurant[] }) {
  const total = restaurants.length;
  const visited = restaurants.filter((restaurant) => restaurant.visited).length;
  const pending = Math.max(total - visited, 0);
  const ratio = total ? visited / total : 0;

  return (
    <Card className="overflow-hidden border-primary/15 bg-[linear-gradient(145deg,oklch(0.997_0.006_74),oklch(0.965_0.024_82))] shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-primary">
              <Sparkles className="size-4" />
              La ruta Michelin de Peldaños
            </div>
            <p className="mt-1 text-2xl font-black leading-tight tracking-tight">
              Visitados {visited} de {total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              La aventura va por el {formatPercent(ratio)}.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary px-3 py-2 text-center text-sm font-black leading-none text-primary-foreground shadow-sm">
            {formatPercent(ratio)}
          </div>
        </div>
        <Progress
          className="mt-4 h-2.5 border border-primary/10 bg-card/80"
          value={ratio * 100}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
          <div className="flex items-center gap-2 rounded-xl border bg-card/75 px-3 py-2 text-emerald-800 shadow-sm">
            <CheckCircle2 className="size-4" />
            <span>{visited} completados</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card/75 px-3 py-2 text-muted-foreground shadow-sm">
            <TimerReset className="size-4 text-primary" />
            <span>{pending} por caer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

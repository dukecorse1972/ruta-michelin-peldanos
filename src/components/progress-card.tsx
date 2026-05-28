import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";
import type { Restaurant } from "@/lib/types";

export function ProgressCard({ restaurants }: { restaurants: Restaurant[] }) {
  const total = restaurants.length;
  const visited = restaurants.filter((restaurant) => restaurant.visited).length;
  const ratio = total ? visited / total : 0;

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/90">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              La ruta Michelin de Peldaños
            </div>
            <p className="mt-1 text-2xl font-black tracking-tight">
              Visitados {visited} de {total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Siguiendo, plato a plato, la aventura va por el{" "}
              {formatPercent(ratio)}.
            </p>
          </div>
          <div className="rounded-full bg-accent px-3 py-1 text-sm font-black text-accent-foreground">
            {formatPercent(ratio)}
          </div>
        </div>
        <Progress className="mt-4" value={ratio * 100} />
      </CardContent>
    </Card>
  );
}

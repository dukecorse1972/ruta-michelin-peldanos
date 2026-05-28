# La ruta Michelin de Peldaños

Fan project en Next.js para seguir la serie de YouTube de Peldaños visitando restaurantes Michelin de España. Incluye mapa, progreso, fichas, login con Google, admin, seed Supabase y cron de YouTube.

## Stack

- Next.js App Router + TypeScript estricto
- Tailwind CSS v4 + componentes estilo shadcn/ui
- Supabase Auth, Postgres y RLS
- Leaflet + OpenStreetMap
- Vercel Cron Jobs
- YouTube Data API y OpenAI opcional para matching

## Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
OPENAI_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sin variables Supabase, la home usa `data/restaurants.seed.json` como fallback para desarrollo visual.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_initial_schema.sql` en el SQL editor o con Supabase CLI.
3. En Authentication, activa Google como provider.
4. Añade como redirect URL: `http://localhost:3000/auth/callback` y la URL de Vercel cuando despliegues.
5. Ejecuta el seed:

```bash
npm run seed
```

Para crear el primer admin, entra con Google y ejecuta:

```sql
update public.profiles set role = 'admin' where email = 'tu-email@gmail.com';
```

## Datos Michelin

El proyecto hace upsert por `slug` desde `data/restaurants.seed.json`. El seed incluido contiene los 306 restaurantes españoles con Estrella MICHELIN 2026 extraídos del artículo oficial de Michelin, excluyendo el restaurante de Andorra. Incluye nombre, ciudad, comunidad autónoma, número de estrellas, URL Michelin y coordenadas aproximadas por localidad para que todos aparezcan en el mapa.

Para regenerarlo desde la página oficial, guarda primero el HTML del artículo en `.next/michelin-article.html` y ejecuta:

```bash
pwsh -Command "Invoke-WebRequest -Uri 'https://guide.michelin.com/es/es/articulo/michelin-guide-ceremony/todos-los-restaurantes-con-estrellas-michelin-en-espana-2026' -UseBasicParsing | Select-Object -ExpandProperty Content | Set-Content -LiteralPath '.next/michelin-article.html' -Encoding UTF8"
npm run generate:michelin-seed
```

Después, carga o actualiza Supabase:

```bash
npm run seed
```

Campos soportados:

```json
{
  "name": "Disfrutar",
  "slug": "disfrutar",
  "stars": 3,
  "city": "Barcelona",
  "province": "Barcelona",
  "autonomous_community": "Cataluña",
  "address": "...",
  "latitude": 41.38,
  "longitude": 2.15,
  "cuisine_type": "Creativa",
  "official_website": "https://...",
  "tasting_menu_url": "https://...",
  "image_url": "https://...",
  "michelin_url": "https://...",
  "is_active": true,
  "visited": false,
  "youtube_video_id": null,
  "youtube_url": null
}
```

## YouTube y cron

El endpoint `GET /api/cron/sync-youtube` exige:

```http
Authorization: Bearer <CRON_SECRET>
```

Hace lo siguiente:

- consulta los últimos vídeos del canal `YOUTUBE_CHANNEL_ID`;
- guarda cada vídeo en `youtube_videos`;
- detecta si parece parte de la serie Michelin;
- intenta match directo, alias y fuzzy;
- usa OpenAI como fallback si `OPENAI_API_KEY` está configurada;
- marca el restaurante como visitado solo con `confidence >= 0.85`;
- deja `needs_review = true` si no hay confianza suficiente.

`vercel.json` configura un cron diario a las 07:00 UTC.

## Admin

Rutas:

- `/admin`: resumen
- `/admin/restaurants`: edición básica, estado visitado y vídeo asociado
- `/admin/videos`: vídeos detectados, pendientes de revisión y asociación manual

Todas requieren `profiles.role = 'admin'`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run seed
```

## Despliegue en Vercel

1. Conecta el repo en Vercel.
2. Añade las variables de entorno.
3. Configura en Supabase la URL de callback de producción: `https://tu-dominio.vercel.app/auth/callback`.
4. Despliega.
5. Comprueba el cron desde Vercel o llamando al endpoint con el bearer correcto.

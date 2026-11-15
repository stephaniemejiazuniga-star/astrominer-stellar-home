import { createFileRoute } from "@tanstack/react-router";
import { MainMenu } from '@/game/ui/MainMenu';

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: MainMenu,
  head: () => ({ meta: [
    { title: 'ASTROMINER · Comienza tu expedición' },
    { name: 'description', content: 'El universo te espera. Descubre ASTROMINER, una aventura educativa de exploración, ciencia y supervivencia espacial.' },
    { property: 'og:title', content: 'ASTROMINER · Comienza tu expedición' },
    { property: 'og:description', content: 'Explora. Sobrevive. Descubre. Tu aventura educativa comienza en Marte.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
});

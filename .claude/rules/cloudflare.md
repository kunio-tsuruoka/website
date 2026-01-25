# Cloudflare Pages + Astro SSR

## Environment Variables at Runtime

- `import.meta.env` only works at **build time**
- For SSR runtime, use `Astro.locals.runtime.env`

```typescript
// In .astro pages
const runtime = (Astro.locals as { runtime?: { env?: EnvType } }).runtime;
const env = runtime?.env;

// In API routes (APIRoute)
export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as { runtime?: { env?: EnvType } }).runtime;
  const env = runtime?.env;
};
```

## MicroCMS Functions Pattern

Pass env as optional parameter to support both local dev and Cloudflare:

```typescript
export async function getData(env?: MicroCMSEnv) {
  const client = getClient(env); // falls back to import.meta.env
  // ...
}
```

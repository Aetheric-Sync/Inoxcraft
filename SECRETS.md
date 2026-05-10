# Required GitHub Secrets

Add these at: github.com/[your-username]/inoxcraft/settings/secrets/actions

| Secret name              | Where to get it                             |
| ------------------------ | ------------------------------------------- |
| DATABASE_URL             | Neon dashboard — Connection string (pooled) |
| DIRECT_URL               | Neon dashboard — Connection string (direct) |
| NEXTAUTH_SECRET          | Run: openssl rand -base64 32                |
| RESEND_API_KEY           | resend.com → API Keys                       |
| UPSTASH_REDIS_REST_URL   | console.upstash.com → Redis → REST API      |
| UPSTASH_REDIS_REST_TOKEN | console.upstash.com → Redis → REST API      |
| BLOB_READ_WRITE_TOKEN    | vercel.com → Storage → Blob → token         |
| VERCEL_TOKEN             | vercel.com → Account Settings → Tokens      |
| VERCEL_ORG_ID            | vercel.com → Settings → General → Team ID   |
| VERCEL_PROJECT_ID        | vercel.com → Project → Settings → General   |

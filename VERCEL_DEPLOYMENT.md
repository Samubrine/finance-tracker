# Prisma Vercel Deployment Configuration

## Overview
This project is now configured to properly deploy Prisma to Vercel using the `@prisma/nextjs-monorepo-workaround-plugin`. This plugin ensures that all necessary Prisma engine files (like `libquery_engine-rhel-openssl-3.0.x.so.node`) are included in the deployment bundle.

## What Was Configured

### 1. Plugin Installation
The `@prisma/nextjs-monorepo-workaround-plugin` package is already installed in `devDependencies`:
```json
"@prisma/nextjs-monorepo-workaround-plugin": "^6.18.0"
```

### 2. Next.js Configuration (`next.config.ts`)
Added Webpack configuration to use the PrismaPlugin on server-side builds:

```typescript
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'

webpack: (config, { isServer }) => {
  if (isServer) {
    config.plugins = [...config.plugins, new PrismaPlugin()]
  }
  return config
}
```

### 3. TypeScript Definitions
Created `types/prisma-plugin.d.ts` to provide type definitions for the plugin, ensuring TypeScript compatibility.

## Why This Is Needed

When deploying to Vercel, the platform aggressively optimizes serverless functions, which can sometimes strip out Prisma's native engine files. This plugin ensures that:

- All necessary Prisma engine binaries are copied to the correct locations
- The deployment bundle includes the right engine for Vercel's runtime environment (RHEL with OpenSSL 3.0)
- Your application can successfully connect to the database in production

## When This Plugin Is NOT Needed

You can remove this plugin if:

1. You configure Prisma ORM without Rust engines by setting `engineType = "binary"` in your generator block:
   ```prisma
   generator client {
     provider   = "prisma-client-js"
     engineType = "binary"
   }
   ```

2. You use the new `prisma-client` generator (when available)

## Build Process

The build script in `package.json` already includes `prisma generate`:
```json
"build": "prisma generate && next build"
```

This ensures that:
1. Prisma Client is generated before building
2. The PrismaPlugin can find and copy the necessary files
3. All engine binaries are included in the Vercel deployment

## Deployment Checklist

Before deploying to Vercel:

- ✅ Ensure `DATABASE_URL` is set in Vercel environment variables
- ✅ Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are configured
- ✅ Run `npm run build` locally to verify the build works
- ✅ Commit all changes including the updated `next.config.ts`

## Additional Resources

- [Prisma Module Bundlers Documentation](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/bundlers)
- [Prisma Vercel Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [PrismaPlugin GitHub Repository](https://github.com/prisma/prisma/tree/main/packages/nextjs-monorepo-workaround-plugin)

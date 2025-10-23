# Prisma Vercel Deployment Guide

## Overview
This project uses Prisma ORM with Next.js 16 and requires special configuration for Vercel deployment due to Turbopack limitations.

## ⚠️ Important: Turbopack vs Webpack Issue

**The Problem**: Next.js 16 uses Turbopack by default, but Turbopack does not properly bundle Prisma's native engine files (`libquery_engine-rhel-openssl-3.0.x.so.node`) for Vercel deployment. This causes runtime errors on Vercel.

**The Solution**: We use the `@prisma/nextjs-monorepo-workaround-plugin` with webpack configuration to ensure Prisma engine files are correctly bundled.

## Configuration Applied

### 1. Prisma Schema - Binary Targets (CRITICAL!)

In `prisma/schema.prisma`, add the Vercel binary target:

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "./generated/client"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

**Why this is needed**: Prisma must generate the engine binary for Vercel's RHEL runtime. Without this, the engine file won't exist in the deployment, causing the "Query Engine not found" error.

### 2. Webpack Configuration with PrismaPlugin

In `next.config.ts`, we use webpack instead of Turbopack for server-side bundling:

```typescript
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'

webpack: (config, { isServer }) => {
  if (isServer) {
    config.plugins = [...config.plugins, new PrismaPlugin()]
  }
  return config
}
```

### 2. The Expected Warning

You will see this warning during builds:
```
ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
```

**This warning is expected and necessary.** It indicates that Next.js is using your webpack configuration (with PrismaPlugin) instead of Turbopack, which is exactly what we need for Prisma to work on Vercel.

## Why This Plugin Is Needed (Even for Non-Monorepos)

While Prisma's documentation states the plugin is primarily for monorepos, **it's also needed for Next.js 16 with Turbopack** because:

1. **Turbopack Limitation**: Turbopack doesn't copy Prisma engine binaries correctly to the deployment folder
2. **Vercel Runtime**: Vercel's serverless functions need the specific RHEL engine binary
3. **Build Optimization**: Vercel's aggressive optimization can strip out necessary files

The PrismaPlugin ensures all engine files are present in the final bundle.

### Build Script

The build script in `package.json` includes `prisma generate`:
```json
"build": "prisma generate && next build"
```

This ensures that:
1. Prisma Client is generated before building
2. All necessary Prisma files are included automatically
3. Turbopack bundles everything correctly for production

## How the Build Works

When you deploy to Vercel:

1. **Prisma Generate**: Runs `prisma generate` to create the Prisma Client
2. **Webpack Build**: Uses webpack (not Turbopack) for server-side code
3. **PrismaPlugin**: Copies all necessary Prisma engine files to the bundle
4. **Deployment**: Vercel deploys with all required engine binaries included

## Build Instructions

### Local Build

When building locally, you will see a Turbopack warning. This is expected:

```bash
npm run build
```

**Expected output:**
```
ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
```

The build will complete successfully despite the warning. The warning simply indicates that webpack is being used (which is what we want).

### Vercel Deployment

Vercel will run the same build process automatically. The build will succeed, and Prisma will work correctly in production.

## Deployment Checklist

### Required Environment Variables

Set these in your Vercel project settings:

```bash
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
```

### Pre-Deployment Steps

- ✅ Ensure `prisma/schema.prisma` is committed
- ✅ Test the build locally: `npm run build`
- ✅ Verify environment variables are set in Vercel
- ✅ Push your code to GitHub
- ✅ Connect your repository to Vercel
- ✅ Deploy!

## Database Setup

### For Production Deployment

1. **Choose a database provider** that offers PostgreSQL, MySQL, or SQLite hosting:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Recommended for Vercel)
   - [PlanetScale](https://planetscale.com/)
   - [Railway](https://railway.app/)
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)

2. **Update your Prisma schema** if needed (currently using SQLite):
   ```prisma
   datasource db {
     provider = "postgresql"  // or "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations** in production:
   ```bash
   npx prisma migrate deploy
   ```

### SQLite Limitations

⚠️ **Important**: Your current setup uses SQLite, which has limitations on serverless platforms like Vercel:
- SQLite files are ephemeral on Vercel (reset on each deployment)
- Not suitable for production use on serverless platforms
- Consider switching to PostgreSQL or MySQL for production

## Local Testing

Test that your build works correctly:

```bash
# Generate Prisma Client
npx prisma generate

# Build the project
npm run build

# Start production server locally
npm start
```

## Troubleshooting

### Error: "Prisma Client could not locate the Query Engine for runtime 'rhel-openssl-3.0.x'"

This error means the Prisma engine files are not included in the deployment. Solutions:

1. **Verify webpack config**: Ensure `next.config.ts` has the PrismaPlugin configuration
2. **Check plugin installation**: Verify `@prisma/nextjs-monorepo-workaround-plugin` is installed
3. **Redeploy**: Sometimes a fresh deployment fixes bundling issues
4. **Check build logs**: Look for any errors during `prisma generate` or build process

### If you see other Prisma engine errors on Vercel:

1. **Check DATABASE_URL**: Ensure it's properly set in Vercel environment variables
2. **Check Database Connection**: Verify your database is accessible from Vercel's servers
3. **Check Migrations**: Ensure migrations are run in production with `npx prisma migrate deploy`
4. **Check Logs**: Use Vercel's deployment logs to see detailed error messages
5. **Verify Prisma version**: Ensure `@prisma/client` and `prisma` versions match in `package.json`

### If builds fail locally:

1. **Clear the build cache**: `rm -rf .next`
2. **Regenerate Prisma Client**: `npx prisma generate`
3. **Reinstall dependencies**: `rm -rf node_modules && npm install`
4. **Try building again**: `npm run build`

## Additional Resources

- [Prisma Vercel Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js 16 Turbopack Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Prisma Module Bundlers Documentation](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/bundlers)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Scheduled Reddit Scans

This project supports high-volume recurring scan runs through `POST /api/search/scheduled`.

### Required server env vars

- `CRON_SECRET`: shared secret used by the scheduler trigger.
- `SCHEDULED_BATCH_LIMIT` (optional, default `5`): number of due scrapers processed per trigger.
- `SCHEDULED_MAX_POSTS_PER_SUBREDDIT` (optional, default `180`): cap per subreddit per run.
- `SCHEDULED_MAX_SUBREDDITS` (optional, default `10`): subreddit count cap per run.
- `SCHEDULED_PROCESSING_LIMIT` (optional, default `8`): number of fetched posts sent to AI extraction per run.
- `REDDIT_USER_AGENT` (optional): custom Reddit user-agent string.

### GitHub Actions scheduler

Workflow file: `.github/workflows/scheduled-reddit-scan.yml`

Required GitHub repository secrets:

- `APP_BASE_URL`: deployed app URL (e.g. `https://your-app.vercel.app`)
- `CRON_SECRET`: same value as server `CRON_SECRET`

/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  output: 'standalone',
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT, // should resolve to your Next.js project, not "node-nestjs"

  // Only print source map upload logs in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests through a Next.js rewrite to avoid ad blockers
  // Make sure this path doesn't collide with your middleware matcher
  tunnelRoute: '/monitoring',

  // Tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Automatic instrumentation of Vercel Cron Monitors (only relevant if deployed on Vercel)
  automaticVercelMonitors: false,
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // If you add Content-Security-Policy later, ensure connect-src includes:
  // 'self' https://*.supabase.co wss://*.supabase.co
  // to avoid blocking Supabase API calls.
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;

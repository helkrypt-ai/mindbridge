/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: set output: 'export' only when building for Capacitor mobile
  // For Vercel deployment, omit this line
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;

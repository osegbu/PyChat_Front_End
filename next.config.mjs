/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "my-nextjs-app-service",
      },
    ],
  },
};

export default nextConfig;

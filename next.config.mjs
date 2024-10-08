/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "54.175.214.30",
        port: "30000",
      },
      {
        protocol: "http",
        hostname: "54.175.214.30",
        port: "30001",
      },
      {
        protocol: "http",
        hostname: "54.175.214.30",
        port: "30002",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;

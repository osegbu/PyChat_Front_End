/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "100.26.193.126",
        port: "30067",
      },
      {
        protocol: "http",
        hostname: "100.26.193.126",
        port: "30068",
      },
      {
        protocol: "http",
        hostname: "100.26.193.126",
        port: "30069",
      },
    ],
  },
};

export default nextConfig;

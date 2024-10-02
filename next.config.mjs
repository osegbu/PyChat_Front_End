/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "http://100.26.193.126:30067",
      },
    ],
  },
};

export default nextConfig;

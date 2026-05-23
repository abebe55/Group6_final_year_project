import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8080/uploads/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8443",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
        pathname: "/**",
      },
      // Adobe Stock / Fotolia
      {
        protocol: "https",
        hostname: "**.ftcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.adobe.com",
        pathname: "/**",
      },
      // Shutterstock
      {
        protocol: "https",
        hostname: "**.shutterstock.com",
        pathname: "/**",
      },
      // iStock
      {
        protocol: "https",
        hostname: "**.istockphoto.com",
        pathname: "/**",
      },
      // Getty Images
      {
        protocol: "https",
        hostname: "**.gettyimages.com",
        pathname: "/**",
      },
      // Pixabay
      {
        protocol: "https",
        hostname: "**.pixabay.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/**",
      },
      // Imgur
      {
        protocol: "https",
        hostname: "**.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      // Google user content
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "/**",
      },
      // AWS S3
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      // Firebase Storage
      {
        protocol: "https",
        hostname: "**.firebasestorage.googleapis.com",
        pathname: "/**",
      },
      // Generic image CDNs
      {
        protocol: "https",
        hostname: "**.imgix.net",
        pathname: "/**",
      },
      // Allow any HTTPS image (fallback - less secure but flexible)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

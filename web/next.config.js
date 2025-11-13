/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:8080/:path*',
      },
      {
        source: '/alphabrain/:path*',
        destination: 'http://alphabrain:8081/:path*',
      },
      {
        source: '/ecoscan/:path*',
        destination: 'http://ecoscan:8082/:path*',
      },
    ];
  },
}

module.exports = nextConfig

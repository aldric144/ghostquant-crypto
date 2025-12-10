/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    // Use environment variable for backend URL, fallback to DigitalOcean production URL
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/alphabrain/:path*',
        destination: `${backendUrl}/alphabrain/:path*`,
      },
      {
        source: '/ecoscan/:path*',
        destination: `${backendUrl}/ecoscan/:path*`,
      },
    ];
  },
}

module.exports = nextConfig

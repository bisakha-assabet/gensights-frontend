
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || 'http://pratigya.gensights:3000' 
          },
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, X-CSRFToken, Device, Origin'
          },
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          }
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
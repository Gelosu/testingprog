const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Ignore the @mapbox/node-pre-gyp HTML file
    config.module.rules.push({
      test: /@mapbox\/node-pre-gyp\/lib\/util\/nw-pre-gyp\/index.html/,
      use: "ignore-loader",
    });

    return config;
  },
};

module.exports = nextConfig;

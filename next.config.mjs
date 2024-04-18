/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.fallback = { ...config.resolve.fallback, self: false };
		return config;
	},
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "https",
				hostname: "github.com",
			},
		],
	},
};

export default nextConfig;

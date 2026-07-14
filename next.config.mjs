/** @type {import('next').NextConfig} */
const nextConfig = {
  // three.js ships untranspiled ESM/addon code that Next's default
  // pipeline chokes on — this line is required for R3F projects,
  // not optional.
  transpilePackages: ['three'],
};

export default nextConfig;

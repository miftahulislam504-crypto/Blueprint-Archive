/** @type {import('next').NextConfig} */
const nextConfig = {
  // three.js ships untranspiled ESM/addon code that Next's default
  // pipeline chokes on — this line is required for R3F projects,
  // not optional.
  transpilePackages: ['three'],

  // Next.js does NOT apply long-lived caching to files in /public by
  // default — the default response is `Cache-Control: public,
  // max-age=0, must-revalidate`, meaning every repeat visit re-validates
  // (often re-downloading) every GLB in public/models, including the
  // ~1.9MB avatar. That's real bandwidth/load-time cost paid again on
  // every single return visit, for assets that essentially never change
  // between deploys.
  //
  // 30 days rather than the full year+immutable treatment hashed
  // /_next/static assets get, specifically because these filenames have
  // no content hash — if a model is ever swapped in place (same
  // filename, different content), a shorter TTL means visitors pick up
  // the change within a month instead of being stuck on a stale cached
  // copy for a year. If a model changes, the safest fix is still to
  // rename the file (avatar-adventurer-v2.glb) so old caches simply
  // can't apply to it at all — but this cap keeps the blast radius small
  // even if that's forgotten.
  async headers() {
    return [
      {
        source: '/models/:path*.glb',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const { PHASE_PRODUCTION_BUILD, PHASE_EXPORT } = require('next/constants')

const mode = process.env.NEXT_PUBLIC_BUILD_MODE
const basePath = process.env.EXPORT_BASE_PATH || ''

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  const nextConfig = {
    images: {
      unoptimized: mode === 'export',
    },
    reactStrictMode: false,
  }
  if (mode === 'export') {
    nextConfig.output = 'export'
    // Only used for static deployment, the default deployment directory is the root directory
    nextConfig.basePath = basePath
  } else if (mode === 'standalone') {
    nextConfig.output = 'standalone'
  }

  if (mode !== 'export') {
    nextConfig.rewrites = async () => {
      return {
        beforeFiles: [
          {
            source: '/api/google/v1beta/models/:model',
            destination: '/api/chat?model=:model',
          },
        ],
      }
    }
  }

  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_EXPORT) {
    const withSerwist = (await import('@serwist/next')).default({
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: 'app/sw.ts',
      swDest: 'public/sw.js',
      register: false,
    })
    return withSerwist(nextConfig)
  }

  return nextConfig
}

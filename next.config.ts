import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'SkillDrill';
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (isGithubPages ? `/${repositoryName}` : '');

const nextConfig: NextConfig = {
  output: isGithubPages ? 'export' : undefined,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;

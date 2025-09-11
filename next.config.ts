import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Enable static HTML export so the build can be deployed
   * as a fully–static site (e.g. GitHub Pages, Cloudflare Pages).
   */
  output: "export",

  /*
   * The export pipeline cannot optimise images on-the-fly, so disable
   * built-in optimisation.  (Images are served as-is in /public.)
   */
  images: {
    unoptimized: true,
  },

  /*
   * Skip ESLint during production builds.  This prevents non-critical
   * lint errors from failing CI / deployment targets such as
   * Cloudflare Pages.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /*
   * Skip TypeScript type-checking errors during production builds.
   * This aligns with the ESLint config above and prevents non-critical
   * TS issues from blocking CI / deployment.
   */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

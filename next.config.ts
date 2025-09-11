import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Enable static HTML export so the build can be deployed
   * as a fully–static site (e.g. GitHub Pages, Cloudflare Pages).
   */
  output: "export",

  /*
   * When running on platforms like Cloudflare Pages, using the
   * Edge Runtime ensures compatibility with their global network.
   */
  experimental: {
    runtime: "edge",
  },

  /*
   * The export pipeline cannot optimise images on-the-fly, so disable
   * built-in optimisation.  (Images are served as-is in /public.)
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

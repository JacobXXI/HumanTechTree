import type { NextConfig } from "next";

const repositoryName = "HumanTechTree";
const isStaticDeploy = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: isStaticDeploy ? `/${repositoryName}/` : undefined,
  basePath: isStaticDeploy ? `/${repositoryName}` : "",
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;

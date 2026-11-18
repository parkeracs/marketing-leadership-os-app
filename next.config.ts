import type { NextConfig } from "next";
import path from "node:path";

// On Vercel the content folder is VAULT_DIR: .vault (the private vault, cloned at build time)
// or demo-content (the bundled demo). Server functions only get files they're told about,
// so bundle the case-study images (logos and screenshots) and swipe images with the asset route.
// Only folders inside the project can be traced; a local build pointed elsewhere skips this.
const contentDir = path.relative(process.cwd(), path.resolve(process.env.VAULT_DIR ?? ".vault"));
const inProject = contentDir !== "" && !contentDir.startsWith("..") && !path.isAbsolute(contentDir);

const nextConfig: NextConfig = {
  outputFileTracingIncludes: inProject
    ? { "/api/asset": [`./${contentDir}/case-studies/images/**/*`, `./${contentDir}/attachments/swipe/**/*`] }
    : {},
};

export default nextConfig;

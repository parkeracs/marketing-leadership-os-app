// Runs before every build (npm "prebuild").
// Private build on Vercel: clone the private vault repo with a read-only token.
// Demo build (DEMO_MODE=true), anywhere: fail closed. It reads the bundled demo-content/ folder
// (or clones a public repo named in VAULT_REPO). No token is ever used, so a private repo
// cannot be cloned, and the content folder must carry the .demo-content marker.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEMO_MARKER = ".demo-content";
const demo = process.env.DEMO_MODE === "true";
const dir = process.env.VAULT_DIR;
const repo = process.env.VAULT_REPO; // e.g. <owner>/<vault-repo>
const token = process.env.GITHUB_TOKEN; // fine-grained, read-only, this one repo; private builds only

function fail(message) {
  console.error(`[fetch-vault] ${message}`);
  process.exit(1);
}

if (demo) {
  if (token) fail("DEMO_MODE is on and GITHUB_TOKEN is set. Remove the token: a demo build only reads public content.");
  if (!dir) fail("DEMO_MODE is on but VAULT_DIR is not set. Point it at the demo content folder.");
  // With VAULT_REPO set, clone that public repo. Without it, read the folder already in this repo
  // (the bundled demo-content/), locally and on Vercel alike.
  if (process.env.VERCEL && repo) {
    fs.rmSync(dir, { recursive: true, force: true });
    try {
      // No credentials, no credential helper and no prompt: a private repo fails here instead of being cloned.
      execSync(`git -c credential.helper= clone --depth 1 https://github.com/${repo}.git ${dir}`, {
        stdio: "ignore",
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
      });
    } catch {
      fail(`Could not clone ${repo} without credentials. A demo build only reads a public repo.`);
    }
    console.log(`[fetch-vault] Demo: cloned public repo ${repo} into ${dir}.`);
  }
  if (!fs.existsSync(path.join(dir, DEMO_MARKER))) {
    fail(`DEMO_MODE is on but ${path.resolve(dir)} has no ${DEMO_MARKER} marker. Only folders marked as demo content can be published.`);
  }
  console.log(`[fetch-vault] Demo content verified at ${path.resolve(dir)}.`);
  process.exit(0);
}

if (!process.env.VERCEL) {
  console.log("[fetch-vault] Local build: using the sibling vault folder.");
  process.exit(0);
}
if (!dir || !repo || !token) {
  fail("VAULT_DIR, VAULT_REPO and GITHUB_TOKEN must be set on Vercel.");
}
fs.rmSync(dir, { recursive: true, force: true });
execSync(`git clone --depth 1 https://x-access-token:${token}@github.com/${repo}.git ${dir}`, { stdio: "ignore" });
console.log(`[fetch-vault] Cloned ${repo} into ${dir}.`);

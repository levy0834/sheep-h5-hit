import { defineConfig } from "vite";

function resolveBasePath(): string {
  const explicitBase = process.env.VITE_BASE_PATH?.trim();
  if (explicitBase) {
    return explicitBase.endsWith("/") ? explicitBase : `${explicitBase}/`;
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const isGithubActions = process.env.GITHUB_ACTIONS === "true";

  if (isGithubActions && repoName) {
    return `/${repoName}/`;
  }

  return "/";
}

export default defineConfig({
  base: resolveBasePath(),
});

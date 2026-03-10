import { defineConfig } from "vite";

function normalizeBasePath(basePath: string): string {
  if (basePath === ".") {
    return "./";
  }

  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function resolveBasePath(command: "serve" | "build", isPreview: boolean): string {
  const explicitBase = process.env.VITE_BASE_PATH?.trim();
  if (explicitBase) {
    return normalizeBasePath(explicitBase);
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const isGithubActions = process.env.GITHUB_ACTIONS === "true";

  const isBuildLike = command === "build" || isPreview;

  if (isBuildLike && isGithubActions && repoName) {
    return `/${repoName}/`;
  }

  if (isBuildLike) {
    return "./";
  }

  return "/";
}

export default defineConfig(({ command, isPreview = false }) => ({
  base: resolveBasePath(command, isPreview),
}));

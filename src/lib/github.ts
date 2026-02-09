const GITHUB_ORG = "VideoML";

export const VIDEO_ML_REPOS = {
  site: "videoml-org",
  specification: "specification",
  player: "player",
  stdlib: "stdlib",
  toolchain: "toolchain",
  cli: "cli",
} as const;

export type VideoMLRepoKey = keyof typeof VIDEO_ML_REPOS;

const repoBaseUrl = (repo: VideoMLRepoKey) => `https://github.com/${GITHUB_ORG}/${VIDEO_ML_REPOS[repo]}`;

export const githubRepoUrl = (repo: VideoMLRepoKey) => repoBaseUrl(repo);

export const githubBlobUrl = (repo: VideoMLRepoKey, path: string) => {
  const clean = path.replace(/^\/+/, "");
  return `${repoBaseUrl(repo)}/blob/main/${clean}`;
};

export const githubTreeUrl = (repo: VideoMLRepoKey, path = "") => {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${repoBaseUrl(repo)}/tree/main/${clean}` : `${repoBaseUrl(repo)}/tree/main`;
};

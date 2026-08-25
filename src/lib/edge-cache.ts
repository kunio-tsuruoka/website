export type EdgeCacheEnv = {
  CF_PAGES_BRANCH?: string;
  CF_PAGES_COMMIT_SHA?: string;
};

export function resolveEdgeCacheKeyUrl(requestUrl: string | URL, env: EdgeCacheEnv = {}): string {
  const url = new URL(requestUrl.toString());
  const deploymentKey = env.CF_PAGES_COMMIT_SHA || env.CF_PAGES_BRANCH;

  if (deploymentKey) {
    url.searchParams.set('__edge_deploy', deploymentKey);
  }

  return url.toString();
}

const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO ?? '';

export function resolvePublicUrl(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalized = path.replace(/^\//, '');
  return `${base}${normalized}`;
}

export function resolveGithubTreeUrl(projectPath: string): string {
  if (!GITHUB_REPO) {
    return '#';
  }
  return `https://github.com/${GITHUB_REPO}/tree/main/${projectPath}`;
}

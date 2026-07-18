window.PORTFOLIO_CONFIG = {
  githubUser: 'adrianmanu',
  githubRepo: 'pagina-web-personal',
};

window.githubTreeUrl = function (projectPath) {
  const { githubUser, githubRepo } = window.PORTFOLIO_CONFIG;
  return `https://github.com/${githubUser}/${githubRepo}/tree/main/${projectPath}`;
};

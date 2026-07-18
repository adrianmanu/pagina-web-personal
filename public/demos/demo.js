document.addEventListener('DOMContentLoaded', () => {
  const base = window.location.pathname.split('/demos/')[0] + '/';

  const backLink = document.querySelector('.back');
  if (backLink) backLink.href = base;

  document.querySelectorAll('[data-github-path]').forEach((link) => {
    if (window.PORTFOLIO_CONFIG?.hideSourceCode) {
      link.remove();
      return;
    }

    const path = link.getAttribute('data-github-path');
    if (path && window.githubTreeUrl) link.href = window.githubTreeUrl(path);
  });

  document.querySelectorAll('[data-app-url]').forEach((link) => {
    link.href = base + link.getAttribute('data-app-url');
  });

  document.querySelectorAll('[data-apk-url]').forEach((link) => {
    link.href = base + link.getAttribute('data-apk-url');
    link.setAttribute('download', '');
  });
});

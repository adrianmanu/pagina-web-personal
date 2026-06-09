document.addEventListener('DOMContentLoaded', () => {
  const backLink = document.querySelector('.back');
  if (backLink) {
    const base = window.location.pathname.split('/demos/')[0] + '/';
    backLink.href = base;
  }

  document.querySelectorAll('[data-github-path]').forEach((link) => {
    const path = link.getAttribute('data-github-path');
    if (path && window.githubTreeUrl) {
      link.href = window.githubTreeUrl(path);
    }
  });
});

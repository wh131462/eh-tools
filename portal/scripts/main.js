/**
 * EH-Tools Portal - 门户网站交互逻辑
 * 主题切换、表单提交、平滑滚动等功能
 */

// 主题切换
function initTheme() {
  const savedTheme = localStorage.getItem('eh-tools-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('eh-tools-theme', newTheme);
}

// 表单提交处理
function initFeedbackForm() {
  const form = document.getElementById('feedbackForm');
  const successMessage = document.getElementById('feedbackSuccess');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      toolName: formData.get('toolName'),
      category: formData.get('category'),
      description: formData.get('description'),
      contact: formData.get('contact'),
      timestamp: new Date().toISOString()
    };

    // 生成 GitHub Issue 内容
    const issueTitle = `[工具需求] ${data.toolName}`;
    const issueBody = `
## 工具名称
${data.toolName}

## 分类
${data.category || '未指定'}

## 功能描述
${data.description}

## 联系方式
${data.contact || '未提供'}

---
*提交时间: ${data.timestamp}*
*来源: EH Tools 门户网站*
    `.trim();

    // 打开 GitHub Issue 页面
    const issueUrl = `https://github.com/wh131462/eh-tools/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=enhancement,tool-request`;

    // 显示成功消息
    form.classList.add('hidden');
    successMessage.classList.add('show');

    // 延迟打开 GitHub
    setTimeout(() => {
      window.open(issueUrl, '_blank');
    }, 500);

    // 5秒后重置表单
    setTimeout(() => {
      form.reset();
      form.classList.remove('hidden');
      successMessage.classList.remove('show');
    }, 5000);
  });
}

// 平滑滚动
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// 导航栏滚动效果
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFeedbackForm();
  initSmoothScroll();
  initNavbarScroll();

  // 主题切换按钮
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});

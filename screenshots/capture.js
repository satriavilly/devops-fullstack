const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const pages = [
    { url: 'http://localhost:3000/', file: 'landing.png' },
    { url: 'http://localhost:3000/login', file: 'login.png' },
    { url: 'http://localhost:3000/register', file: 'register.png' },
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `C:/VLY/DevOps/fullstack-app-dummy/screenshots/${p.file}`, fullPage: true });
    console.log('Captured:', p.file);
  }

  await browser.close();
})();

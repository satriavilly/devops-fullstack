const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'test123');
  await Promise.all([
    page.waitForNavigation({ timeout: 8000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await page.waitForTimeout(2000);

  if (page.url().includes('login')) {
    const token = await page.evaluate(async () => {
      const r = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
      });
      const d = await r.json();
      return d.token;
    });
    if (token) {
      await page.evaluate((t) => localStorage.setItem('token', t), token);
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
  }

  console.log('URL:', page.url());
  await page.screenshot({ path: 'C:/VLY/DevOps/fullstack-app-dummy/ss2/dashboard.png', fullPage: true });
  console.log('Captured dashboard');
  await browser.close();
})();

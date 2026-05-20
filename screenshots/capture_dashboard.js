const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'test123');
  
  // Click and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 10000 }).catch(e => console.log('nav timeout:', e.message)),
    page.click('button[type="submit"]')
  ]);
  
  await page.waitForTimeout(2000);
  console.log('After submit URL:', page.url());
  
  // If still on login, inject token manually
  if (page.url().includes('login')) {
    console.log('Still on login, checking for error...');
    const errorText = await page.textContent('.bg-red-50').catch(() => 'no error element');
    console.log('Error:', errorText);
    
    // Try injecting token via localStorage directly
    const tokenRes = await page.evaluate(async () => {
      const r = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
      });
      const d = await r.json();
      console.log('login response status:', r.status);
      return d;
    });
    console.log('Token response:', JSON.stringify(tokenRes));
    
    if (tokenRes.token) {
      await page.evaluate((token) => localStorage.setItem('token', token), tokenRes.token);
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
  }
  
  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'C:/VLY/DevOps/fullstack-app-dummy/screenshots/dashboard.png', fullPage: true });
  console.log('Captured: dashboard.png');
  
  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    console.log(`[PAGE ${msg.type()}]:`, msg.text());
  });
  page.on('pageerror', err => {
    console.error('[PAGE ERROR]:', err);
  });

  console.log('1. Navigating to homepage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Take resting homepage screenshot
  await page.screenshot({ path: 'C:/Users/ebrah/.gemini/antigravity/brain/e940c4d9-e1fa-4f25-922d-c0f3267bfd20/test_home_rest.png' });
  console.log('2. Resting homepage captured.');

  // Test hovering a world pill (Attack on Titan)
  console.log('3. Hovering Attack on Titan pill...');
  const aotPill = page.locator('.world-pill[data-slug="attack-on-titan"]');
  await aotPill.hover();
  await page.waitForTimeout(1000);

  const hudVisible = await page.locator('.world-hud.is-visible').isVisible();
  const hudTitle = await page.locator('[data-hud-title]').textContent();
  console.log('HUD visible?', hudVisible, 'Title:', hudTitle);

  await page.screenshot({ path: 'C:/Users/ebrah/.gemini/antigravity/brain/e940c4d9-e1fa-4f25-922d-c0f3267bfd20/test_hover_aot.png' });
  console.log('4. Hover screenshot captured.');

  // Test clicking Attack on Titan
  console.log('5. Clicking Attack on Titan CTA...');
  const hudCta = page.locator('[data-hud-cta]');
  await hudCta.click();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    console.log(`t=${(i+1)*0.5}s, URL=${page.url()}`);
    if (page.url().includes('collection.html')) break;
  }

  await page.screenshot({ path: 'C:/Users/ebrah/.gemini/antigravity/brain/e940c4d9-e1fa-4f25-922d-c0f3267bfd20/test_collection_aot.png' });
  console.log('6. Collection page captured.');

  // Test adding to bag
  console.log('7. Testing Add to Bag...');
  await page.locator('#add-to-cart-btn').click();
  await page.waitForTimeout(600);

  const cartCount = await page.locator('#cart-count').textContent();
  const toastVisible = await page.locator('.cart-toast.is-visible').isVisible();
  console.log('Cart count after add:', cartCount, 'Toast visible?', toastVisible);

  await page.screenshot({ path: 'C:/Users/ebrah/.gemini/antigravity/brain/e940c4d9-e1fa-4f25-922d-c0f3267bfd20/test_cart_toast.png' });

  // Test mobile view
  console.log('8. Testing mobile view...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/ebrah/.gemini/antigravity/brain/e940c4d9-e1fa-4f25-922d-c0f3267bfd20/test_mobile_view.png' });
  console.log('9. Mobile view captured.');

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('ALL PLAYWRIGHT TESTS COMPLETE!');
})();

// utils/helpers.js

const path = require('path');
const fs   = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename  = `${name}_${timestamp}.png`;
  const filepath  = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸  screenshots/${filename}`);
  return filepath;
}

async function waitForPageLoad(page, extraMs = 1500) {
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  if (extraMs > 0) await page.waitForTimeout(extraMs);
}

async function getPageText(page) {
  return (await page.innerText('body')).toLowerCase();
}

module.exports = { takeScreenshot, waitForPageLoad, getPageText };
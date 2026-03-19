const { test, expect } = require('@playwright/test');
const config  = require('../config/config');
const helpers = require('../utils/helpers');

async function doLogin(page) {
  await page.goto(config.AICERTS_URL, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Login With Password').click();
  await page.getByRole('textbox', { name: 'Email *' }).fill(config.EMAIL);
  await page.getByRole('textbox', { name: 'Password *' }).fill(config.PASSWORD);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

async function doLogout(page) {
  // Codegen: click user avatar SVG → "Log out" menuitem
  await page.locator('svg').nth(5).click({ timeout: 5000 }).catch(async () => {
    await page.locator('[class*="avatar"], [class*="user-icon"]')
      .first().click({ timeout: 5000 }).catch(() => {});
  });
  await page.waitForTimeout(800);
  await page.getByRole('menuitem', { name: 'Log out' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);
}

// ─────────────────────────────────────────────────────────────

test.describe('AI Certs Learner Platform', () => {

  test('TC-101 | Application launches successfully', async ({ page }) => {
    await page.goto(config.AICERTS_URL, { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('aicerts');
    await expect(page.getByRole('button', { name: 'Login' }))
      .toBeVisible({ timeout: 10000 });
    const title = await page.title();
    console.log(`✅  Launched. Title: "${title || '(set by JS — see screenshot)'}"`);

    await helpers.takeScreenshot(page, 'TC101_launch');
  });

  // ══════════════════════════════════════════════════════════
  // TC-102 | Login Page Renders Correctly
  // ══════════════════════════════════════════════════════════
  test('TC-102 | Login page renders correctly', async ({ page }) => {
    await page.goto(config.AICERTS_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Login With Password').click();

    await expect(page.getByRole('textbox', { name: 'Email *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password *' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();

    console.log('✅  Login page renders correctly');
    await helpers.takeScreenshot(page, 'TC102_login_page');
  });

  // ══════════════════════════════════════════════════════════
  // TC-103 | Valid Login — Assert Success IMMEDIATELY
  // ══════════════════════════════════════════════════════════
  test('TC-103 | Login with valid credentials — assert success immediately', async ({ page }) => {
    await page.goto(config.AICERTS_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Login With Password').click();
    await page.getByRole('textbox', { name: 'Email *' }).fill(config.EMAIL);
    await page.getByRole('textbox', { name: 'Password *' }).fill(config.PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });

    expect(page.url()).toContain('dashboard');

    await expect(
      page.getByText('Welcome back, Amit!!')
    ).toBeVisible({ timeout: 8000 });

    console.log(`✅  Login success asserted immediately. URL: ${page.url()}`);
    await helpers.takeScreenshot(page, 'TC103_login_success');
  });

  // ══════════════════════════════════════════════════════════
  // TC-104 | Invalid Credentials Show Error
  // ══════════════════════════════════════════════════════════
  test('TC-104 | Invalid credentials show error', async ({ page }) => {
    await page.goto(config.AICERTS_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Login With Password').click();
    await page.getByRole('textbox', { name: 'Email *' }).fill('amit.q@gmail.com');
    await page.getByRole('textbox', { name: 'Password *' }).fill('WrongPass999!');
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.waitForTimeout(3000);

    // Assert 1: Error message shown
    const errorVisible = await page.locator('[class*="error"], [role="alert"]')
      .first().isVisible({ timeout: 5000 }).catch(() => false);

    // Assert 2: Log In button still visible = stayed on login, not redirected
    const loginStillShowing = await page.getByRole('button', { name: 'Log In' })
      .isVisible({ timeout: 3000 }).catch(() => false);

    expect(
      errorVisible || loginStillShowing,
      'Should show error message or remain on login page'
    ).toBe(true);

    console.log(`✅  Invalid login handled. Error shown: ${errorVisible} | On login page: ${loginStillShowing}`);
    await helpers.takeScreenshot(page, 'TC104_invalid_login');
  });

  // ══════════════════════════════════════════════════════════
  // TC-105 | Enrolled Course Visible on Dashboard
  // ══════════════════════════════════════════════════════════
  test('TC-105 | Enrolled course is visible after login', async ({ page }) => {
    await doLogin(page);
    await expect(
      page.getByRole('button', { name: 'View Course' }).first()
    ).toBeVisible({ timeout: 8000 });

    const count = await page.getByRole('button', { name: 'View Course' }).count();
    console.log(`✅  Found ${count} enrolled course(s)`);
    await helpers.takeScreenshot(page, 'TC105_courses_visible');
  });

  // ══════════════════════════════════════════════════════════
  // TC-106 | Open Enrolled Course
  // ══════════════════════════════════════════════════════════
  test('TC-106 | Open an enrolled course', async ({ page }) => {
    await doLogin(page);

    const urlBefore = page.url();

    // Codegen: click "View Course" button
    await page.getByRole('button', { name: 'View Course' }).first().click();
    await page.waitForTimeout(3000);

    expect(page.url()).not.toBe(urlBefore);
    console.log(`✅  Course opened. URL: ${page.url()}`);
    await helpers.takeScreenshot(page, 'TC106_course_opened');
  });

  // ══════════════════════════════════════════════════════════
  // TC-107 | Navigate to Video Section
  // ══════════════════════════════════════════════════════════
  test('TC-107 | Navigate to video section inside the course', async ({ page }) => {
    await doLogin(page);

    await page.getByRole('button', { name: 'View Course' }).first().click();
    await page.waitForTimeout(3000);

    const videoSection = page.locator(
      'video, [class*="video"], [class*="lesson"], [class*="curriculum"], [class*="chapter"]'
    ).first();

    let found = await videoSection.isVisible({ timeout: 5000 }).catch(() => false);

    if (!found) {
      await page.getByRole('tab', { name: /video|lesson|content/i })
        .or(page.getByRole('link', { name: /video|lesson/i }))
        .first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2000);
      found = await videoSection.isVisible({ timeout: 5000 }).catch(() => false);
    }

    expect(found, 'Video section not found inside course').toBe(true);
    console.log('✅  Video section found');
    await helpers.takeScreenshot(page, 'TC107_video_section');
  });

  // ══════════════════════════════════════════════════════════
  // TC-108 | All Videos Accessible (Loop + Screenshots)
  // ══════════════════════════════════════════════════════════
  test('TC-108 | All course videos are accessible', async ({ page }) => {
    await doLogin(page);

    await page.getByRole('button', { name: 'View Course' }).first().click();
    await page.waitForTimeout(3000);

   
    await page.getByRole('tab', { name: /video|lesson/i })
      .or(page.getByRole('link', { name: /video|lesson/i }))
      .first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const VIDEO_ITEM_SELECTORS = [
      '[class*="video-item"]',
      '[class*="lesson-item"]',
      '[class*="lecture-item"]',
      '[class*="chapter"] li',
      '[class*="curriculum"] li',
    ];

    let videoItems = [];
    for (const sel of VIDEO_ITEM_SELECTORS) {
      const items = await page.locator(sel).all();
      if (items.length > 0) {
        videoItems = items;
        console.log(`Found ${items.length} items via: ${sel}`);
        break;
      }
    }

    if (videoItems.length === 0) {
      videoItems = await page.locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]').all();
      console.log(`Found ${videoItems.length} direct video element(s)`);
    }

    if (videoItems.length === 0) {
      console.log('⚠️  No video items found on page');
      await helpers.takeScreenshot(page, 'TC108_no_videos');
      return;
    }

    const results = [];

    for (let i = 0; i < videoItems.length; i++) {
      const label = `Video ${i + 1}`;
      console.log(`\n🎬  Checking ${label}...`);

      try {
        await videoItems[i].scrollIntoViewIfNeeded();

        const tag = await videoItems[i].evaluate(el => el.tagName.toLowerCase());
        if (tag !== 'video' && tag !== 'iframe') {
          await videoItems[i].click();
          await page.waitForTimeout(3000);
        }

        const playerSelectors = [
          'video',
          'iframe[src*="youtube"]',
          'iframe[src*="vimeo"]',
          '[class*="video-player"]',
          '[class*="player"]',
          '.plyr',
          '.vjs-tech',
        ];

        let playerFound = false;
        for (const sel of playerSelectors) {
          const el = page.locator(sel).first();
          if (await el.isVisible({ timeout: 5000 }).catch(() => false)) {
            playerFound = true;
            if (sel === 'video') {
              const state = await el.evaluate(el => ({ hasError: el.error !== null }));
              if (state.hasError) {
                const sc = await helpers.takeScreenshot(page, `TC108_video_${i + 1}_error`);
                results.push({ video: label, status: 'FAIL', reason: 'Video error state', screenshot: sc });
                playerFound = false;
              }
            }
            break;
          }
        }

        if (!playerFound) {
         
          const sc = await helpers.takeScreenshot(page, `TC108_video_${i + 1}_no_player`);
          results.push({ video: label, status: 'FAIL', reason: 'Player did not load', screenshot: sc });
          console.log(`❌  ${label}: Player not found`);
        } else {
          results.push({ video: label, status: 'PASS' });
          console.log(`✅  ${label}: Accessible`);
          await helpers.takeScreenshot(page, `TC108_video_${i + 1}_ok`);
        }

      } catch (err) {
        const sc = await helpers.takeScreenshot(page, `TC108_video_${i + 1}_exception`);
        results.push({ video: label, status: 'FAIL', reason: err.message, screenshot: sc });
        console.log(`❌  ${label}: ${err.message}`);
      }
    }

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`\n📊  Results: ${passed} passed | ${failed} failed | ${results.length} total`);
    results.filter(r => r.status === 'FAIL').forEach(r =>
      console.log(`   ❌ ${r.video}: ${r.reason} | Screenshot: ${r.screenshot}`)
    );

    expect(failed, `${failed} video(s) not accessible`).toBe(0);
  });

  // ══════════════════════════════════════════════════════════
  // TC-109 | Logout Redirects to Login Page
  // ══════════════════════════════════════════════════════════
  test('TC-109 | Logout redirects to login page', async ({ page }) => {
    await doLogin(page);

    // Confirm logged in — Welcome message must be visible
    await expect(page.getByText('Welcome back, Amit!!')).toBeVisible({ timeout: 8000 });
    console.log('✅  Confirmed logged in');

    await doLogout(page);

    const loginBtnVisible = await page.getByRole('button', { name: 'Login' })
      .isVisible({ timeout: 8000 }).catch(() => false);

    const notOnDashboard = !page.url().includes('dashboard');

    const logoutSuccess = loginBtnVisible || notOnDashboard;

    if (!logoutSuccess) await helpers.takeScreenshot(page, 'TC109_logout_FAIL');

    expect(logoutSuccess, `Logout failed. URL: ${page.url()}`).toBe(true);
    console.log(`✅  Logout success. URL: ${page.url()}`);
    await helpers.takeScreenshot(page, 'TC109_logout_success');
  });

});
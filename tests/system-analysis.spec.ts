import { test, expect } from '@playwright/test';

test.describe('HumanGlue System Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:4002');
  });

  test('Landing Page - Basic Load Test', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Human.*Glue/i);
    
    // Take screenshot for visual inspection
    await page.screenshot({ path: 'tests/screenshots/landing-page.png', fullPage: true });
  });

  test('Navigation Components', async ({ page }) => {
    // Check if navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('Hero Section Elements', async ({ page }) => {
    // Check for hero section
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Look for main heading
    const heading = page.locator('h1');
    const headingCount = await heading.count();
    console.log(`Found ${headingCount} h1 elements`);
  });

  test('Chat Interface Visibility', async ({ page }) => {
    // Check if chat interface is present
    const chatElements = await page.locator('[class*="chat"]').count();
    console.log(`Found ${chatElements} chat-related elements`);
    
    // Look for UnifiedChatSystem
    const unifiedChat = await page.locator('[class*="UnifiedChat"]').count();
    console.log(`Found ${unifiedChat} UnifiedChat elements`);
  });

  test('Check for Console Errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(3000); // Wait for page to fully load
    
    console.log('Console Errors Found:', errors);
    
    // Document errors
    if (errors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
  });

  test('Check Missing Resources', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.failure()?.errorText} - ${request.url()}`);
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });

    await page.waitForTimeout(3000);
    
    if (failedRequests.length > 0) {
      console.log('\n=== FAILED REQUESTS ===');
      failedRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req}`);
      });
    }
  });

  test('Interactive Elements Test', async ({ page }) => {
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log(`Found ${buttons} buttons`);
    
    // Check for input fields
    const inputs = await page.locator('input').count();
    console.log(`Found ${inputs} input fields`);
    
    // Check for links
    const links = await page.locator('a').count();
    console.log(`Found ${links} links`);
  });

  test('Voice Components Check', async ({ page }) => {
    // Look for voice-related elements
    const voiceElements = await page.locator('[class*="voice"], [class*="Voice"], [class*="audio"], [class*="Audio"]').count();
    console.log(`Found ${voiceElements} voice/audio related elements`);
    
    // Check for MeetingRoom component
    const meetingRoom = await page.locator('[class*="MeetingRoom"], [class*="meeting"]').count();
    console.log(`Found ${meetingRoom} MeetingRoom elements`);
  });

  test('API Endpoints Health Check', async ({ page }) => {
    const endpoints = [
      '/api/chat',
      '/api/analyze-website',
      '/api/send-email',
      '/api/profile',
      '/api/vapi/create-call'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(`http://localhost:4002${endpoint}`);
        console.log(`${endpoint}: ${response.status()} ${response.statusText()}`);
      } catch (error) {
        console.log(`${endpoint}: FAILED - ${error}`);
      }
    }
  });

  test('Component Visibility Analysis', async ({ page }) => {
    await page.waitForTimeout(2000); // Let page fully render
    
    // Get all visible text
    const visibleText = await page.locator('body').innerText();
    
    console.log('\n=== VISIBLE TEXT ANALYSIS ===');
    console.log('Text length:', visibleText.length);
    console.log('Contains "Human Glue":', visibleText.includes('Human Glue'));
    console.log('Contains "Transform":', visibleText.includes('Transform'));
    console.log('Contains chat-related text:', visibleText.includes('chat') || visibleText.includes('Chat'));
    
    // Check specific components
    const components = {
      'Navigation': 'nav',
      'Footer': 'footer',
      'Main Content': 'main',
      'Hero Section': 'section',
      'Forms': 'form',
      'Modals': '[role="dialog"]',
      'Chat Container': '[id*="chat"], [class*="chat-container"]'
    };
    
    console.log('\n=== COMPONENT VISIBILITY ===');
    for (const [name, selector] of Object.entries(components)) {
      const count = await page.locator(selector).count();
      const isVisible = count > 0 ? await page.locator(selector).first().isVisible() : false;
      console.log(`${name}: ${count} elements, visible: ${isVisible}`);
    }
  });

  test('Generate Full Page Analysis', async ({ page }) => {
    // Get page HTML structure
    const htmlStructure = await page.evaluate(() => {
      const getStructure = (element: Element, depth = 0): any => {
        if (depth > 3) return null; // Limit depth
        
        const children = Array.from(element.children)
          .filter(child => {
            const tagName = child.tagName.toLowerCase();
            return !['script', 'style', 'link', 'meta'].includes(tagName);
          })
          .map(child => getStructure(child, depth + 1))
          .filter(Boolean);
        
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || undefined,
          className: element.className || undefined,
          childCount: element.children.length,
          hasText: element.textContent?.trim().length > 0,
          children: children.length > 0 ? children : undefined
        };
      };
      
      return getStructure(document.body, 0);
    });
    
    console.log('\n=== PAGE STRUCTURE ===');
    console.log(JSON.stringify(htmlStructure, null, 2));
  });
});
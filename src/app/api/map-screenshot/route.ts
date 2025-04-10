import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    // Launch headless browser
    const browser = await puppeteer.launch({ 
      headless: true, // Fix: Changed 'new' to true for compatibility
    });
    
    // Open a new page
    const page = await browser.newPage();
    
    // Set viewport to desired screenshot size
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
    });
    
    // Navigate to the map page
    await page.goto('https://gnars.center/map', { 
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    
    // Wait a bit for any animations or additional content to load
    // Fix: Using setTimeout instead of waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    const screenshot = await page.screenshot({ type: 'png' });
    
    // Close browser
    await browser.close();
    
    // Return the screenshot as an image
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating map screenshot:', error);
    return new NextResponse('Error generating screenshot', { status: 500 });
  }
}

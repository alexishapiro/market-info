/* Complete example.js */
import puppeteer from 'puppeteer';

// Configure launch parameters
async function launchBrowser() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1920, height: 1080 },
    headless: false,
    args: ['--enable-features=Vulkan,WebGPU'],
  });
  return browser;
}

async function main() {
  const browser = await launchBrowser();

  const page = await browser.newPage();
  await page.goto('chrome://gpu');

  // Verify: log the WebGPU status or save the GPU report as PDF
  const txt = await page.waitForSelector('text/WebGPU');
  if (txt) {
    const status = await txt.evaluate(g => g.parentElement ? g.parentElement.textContent : 'No parent element');
    console.log(status);
    await page.pdf({ path: './gpu.pdf' });
  } else {
    console.error('WebGPU text element not found');
  }

  await browser.close();
}

main().catch(console.error);
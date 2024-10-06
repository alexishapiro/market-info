let puppeteer: any;
let StealthPlugin: any;

export async function setupPuppeteer() {
  if (!puppeteer) {
    puppeteer = (await import('puppeteer-extra')).default;
    StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    puppeteer.use(StealthPlugin());
  }
  return puppeteer;
}
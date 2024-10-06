'use server'
import { logError } from '@/lib/errorUtils'
import { db as prisma } from '@/lib/prisma'
import { ScrapingJob } from '@prisma/client'
import { enhance } from '@zenstackhq/runtime'
import { ContentExtractor } from './utils/extractor'
import { setupPuppeteer } from './puppeteer-setup';

// Remove these imports
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// puppeteer.use(StealthPlugin())

export async function findPrevJobs(): Promise<ScrapingJob[]> {
  const jobs = await prisma.scrapingJob.findMany({
    where: {},
  })
  return jobs
}

export async function scrapeData(
  jobId: string,
  csvProducts: any[],
  baseUrl: string,
  log: (message: string) => Promise<void>
) {
  const puppeteer = await setupPuppeteer();

  const browser = await puppeteer.launch({
    // userDataDir: './xoxo',
    headless: false,
    args: [
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-webgl',
      '--disable-webgl2',
      '--disable-3d-apis',
      '--disable-notifications',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-component-extensions-with-background-pages',
      '--disable-extensions',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-default-browser-check',  
      '--no-first-run',
      '--password-store=basic',
      '--use-mock-keychain',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-geolocation',
      '--window-size=320x420',
      '--disable-extensions',
      '--disable-infobars',
      '--ignore-certificate-errors',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--blink-settings=imagesEnabled=false',
    ],
  })

  const context = browser.defaultBrowserContext()
  await context.overridePermissions(baseUrl, ['geolocation'])

  const domain = new URL(baseUrl).hostname
  const page = await browser.newPage()
  // Set up request interception to block image requests
  await page.setRequestInterception(true)

  page.on('request', (request: any) => {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })

  try {
    const job = (await enhance(prisma).scrapingJob.findUnique({
      where: { id: jobId },
    })) as ScrapingJob
    await log(
      `Starting scraping for ${csvProducts.length} products ` +
        'Job ID: ' +
        job.id +
        ' First Product: ' +
        csvProducts[0].List +
        ' Base URL: ' +
        baseUrl
    )

    for (let i = 0; i < csvProducts.length; i++) {
      const product = csvProducts[i]

      const searchTerm = await encodeURIComponent(product.List)
      await log(
        `Processing product ${i + 1} of ${csvProducts.length}: ${product.List}`
      )

      try {
        const url = `${baseUrl}${searchTerm}`
        await log(`Searching URL: ${url}`)

        await page.goto(url, { waitUntil: 'networkidle2' })
        // Wait for the selector
        // await page.waitForSelector('meta[itemprop="sku"]')

        // Get the HTML content of the page
        const html = await page.content()
        // const body = new JSDOM(html).window.document.body

        const extractor = new ContentExtractor(html)
        const cleanedHtml = extractor.extract()
        console.log('-----------------------------------')
        const parsedProductJson =
          await extractor.extractProductInfo(cleanedHtml)
        console.log('-----------------------------------')
        console.log(parsedProductJson)
        // const reader = new Readability(
        //   dom.window.document.getElementByName('main')
        // )
        // const article = reader.parse()
        // Log the parsed content
        // console.log(article?.content)
        // await page.waitForSelector('.xoxoxoxoxoxo')
        // process.exit(0)

        // await page.evaluate(() => {
        //   localStorage.setItem(
        //     'mage-cache-storage',
        //     JSON.stringify({
        //       adult_goods: {
        //         is_adult: false,
        //         data_id: 1722795200,
        //       },
        //       geolocation: {
        //         is_geo_set: true,
        //         city: 'Москва',
        //         city_type_manystores: true,
        //         city_fias_id: '0c5b2444-70a0-4932-980c-b4dc0d3f02b5',
        //         region: 'Москва',
        //         region_fias_id: '0c5b2444-70a0-4932-980c-b4dc0d3f02b5',
        //         fias_id: '0c5b2444-70a0-4932-980c-b4dc0d3f02b5',
        //         fias_code: null,
        //         settlement: null,
        //         settlement_fias_id: null,
        //         locality: 'Москва',
        //         locality_region: null,
        //         store: 'default',
        //         selected_address: null,
        //         data_id: 1722795201,
        //       },
        //     })
        //   )
        // })

        // const productData = await page.evaluate(() => {
        //   const firstProduct = document.querySelector('div[data-scroll-id]')
        //   if (!firstProduct) return null

        //   return {
        //     price:
        //       firstProduct
        //         .querySelector('meta[itemprop="price"]')
        //         ?.getAttribute('content') || 'N/A',
        //     name:
        //       firstProduct
        //         .querySelector('div[class="OIzKF"]')
        //         ?.textContent?.trim() ||
        //       firstProduct
        //         .querySelector('span[class="NjbgM"]')
        //         ?.textContent?.trim() ||
        //       'N/A',
        //     code:
        //       firstProduct
        //         .querySelector('meta[itemprop="sku"]')
        //         ?.getAttribute('content') || '00000000',
        //     brand:
        //       firstProduct
        //         .querySelector('span[class="FkOFi"]')
        //         ?.textContent?.trim() ||
        //       'N/A' ||
        //       firstProduct
        //         .querySelector('meta[itemprop="name"]')
        //         ?.getAttribute('content') ||
        //       'N/A',
        //     rating:
        //       firstProduct
        //         .querySelector('meta[itemprop="ratingValue"]')
        //         ?.getAttribute('content') || 'N/A',
        //     link: '',
        //   }
        // })

        if (parsedProductJson.json.length > 0) {
          try {
            const productData = parsedProductJson.json[0]
            if (!job) {
              throw new Error('Job is null or undefined')
            } else {
              await log(
                `Scraper.ts: Ready for update ${product.List} ${parsedProductJson.name} ${productData.code} ${productData.brand} ${productData.price} ${productData.rating}`
              )
            }
            // Check if the scrapedProduct exists
            let existingProduct = await prisma.scrapedProduct.findFirst({
              where: { scrapingJobId: job.id },
            })
            let updateProduct = null
            if (existingProduct) {
              existingProduct = await prisma.scrapedProduct.update({
                where: { id: existingProduct.id },
                data: {
                  name: productData.product,
                  code: productData.code,
                  brand: productData.brand,
                  price: productData.currentPrice,
                  rating: productData.rating,
                  link:
                    domain + '/' + productData.code + '-' + productData.name,
                },
              })
            } else {
              existingProduct = await prisma.scrapedProduct.create({
                data: {
                  scrapingJobId: job.id,
                  name: productData.product,
                  code: productData.code,
                  brand: productData.brand,
                  price: productData.currentPrice,
                  rating: productData.rating,
                  link:
                    domain + '/' + productData.code + '-' + productData.name,
                },
              })
            }
            await log(
              `Scraper.ts: Data updated ${product.List}: ${JSON.stringify(
                existingProduct
              )}`
            )
            await new Promise((resolve) => setTimeout(resolve, 10000))
            await log('Scraping completed')
            await prisma.scrapingJob.update({
              where: { id: jobId },
              data: { status: 'COMPLETED' },
            })
          } catch (error) {
            await log(
              `Error update data for ${product.List}: ${
                (error as Error).message
              }`
            )
          }
        } else {
          await log(`No data found for ${product.List}`)
        }
      } catch (error) {
        logError(`Scraping product ${product.List}`, error)
        await log(`Error scraping ${product.List}: ${(error as Error).message}`)
      }
    }
  } catch (error) {
    logError(`Scraping job ${jobId}`, error)
    await log(`Error during scraping: ${(error as Error).message}`)
    await prisma.scrapingJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    })
  } finally {
    await browser.close()
  }
}

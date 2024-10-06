import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'
import * as stringify from 'csv-stringify/sync'
import * as winston from 'winston'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import puppeteerExtra from 'puppeteer-extra'

// Setup stealth plugin
puppeteerExtra.use(StealthPlugin())

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} - ${level}: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'scraper.log' }),
  ],
})

// Simple string similarity function
const stringSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length
  const len2 = str2.length
  const maxLength = Math.max(len1, len2)
  if (maxLength === 0) return 100 // If both strings are empty, they're 100% similar

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return ((maxLength - distance) / maxLength) * 100
}

// Levenshtein distance function
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }

  return dp[m][n]
}

// Load the CSV file
const loadCsvFile = (filePath: string): any[] => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })
    logger.info(`CSV file '${filePath}' loaded successfully.`)
    return records
  } catch (error) {
    logger.error(`Failed to load CSV file '${filePath}'. Error: ${error}`)
    throw error
  }
}

// Write to CSV file
const writeToCsv = (filename: string, data: any[], headers: string[]) => {
  const output = stringify.stringify(data, { header: true, columns: headers })
  fs.writeFileSync(filename, output)
  logger.info(`Data written to ${filename}`)
}

// Get product links
const getProductLinks = async (
  page: puppeteer.Page,
  searchTerm: string
): Promise<any[]> => {
  const baseUrl = 'https://goldapple.ru/catalogsearch/result/?q='
  const encodedSearch = encodeURIComponent(searchTerm)
  const url = baseUrl + encodedSearch

  try {
    await page.goto(url, { waitUntil: 'networkidle2' })
    logger.info(`Successfully navigated to URL: ${url}`)

    await page.waitForSelector('div[data-scroll-id]', { timeout: 5000 })

    const productsData = await page.evaluate(() => {
      const findElementContent = (
        element: Element,
        selectors: string[],
        attribute?: string
      ): string => {
        for (const selector of selectors) {
          const foundElements = element.querySelectorAll(selector)
          for (const foundElement of foundElements as any) {
            if (attribute) {
              const attributeValue = foundElement.getAttribute(attribute)
              if (attributeValue) return attributeValue
            } else {
              const textContent = foundElement.textContent?.trim()
              if (textContent) return textContent
            }

            // Recursively check children of this element
            const childContent = findElementContent(
              foundElement,
              ['*'],
              attribute
            )
            if (childContent !== 'N/A') return childContent
          }
        }
        return 'N/A'
      }

      const products = Array.from(
        document.querySelectorAll('div[data-scroll-id]')
      )
      return products.map((product) => {
        const priceSelectors = ['meta[itemprop="price"]', '*[itemprop="price"]']
        const price = findElementContent(product, priceSelectors, 'content')

        const priceCurrencySelectors = [
          'meta[itemprop="priceCurrency"]',
          '*[itemprop="priceCurrency"]',
        ]
        const priceCurrency =
          findElementContent(product, priceCurrencySelectors, 'content') ||
          'RUB'

        const productHrefSelectors = [
          'a[class="_90D61 rx4v2 qcZy3"]',
          'a[class="_90D61 rx4v2 tbTWr"]',
          'a', // Fallback to any anchor tag if specific classes are not found
        ]
        const productHref = findElementContent(
          product,
          productHrefSelectors,
          'href'
        )

        const productId = product.getAttribute('data-scroll-id') || 'N/A'

        const nameSelectors = [
          // "div[class='e4c1q']",
          "div[class='hleTt']",
          // 'div[class="dPoHS"]',
          "div[class='erAf9']",
        ]

        const prddesc = findElementContent(product, nameSelectors)

        const brandSelectors = ['span[itemprop="brand"]', 'span[class="BCQ9K"]']
        const brand =
          findElementContent(product, brandSelectors, 'content') ||
          findElementContent(product, brandSelectors) // Try without attribute if not found

        const ratingSelectors = [
          'meta[itemprop="ratingValue"]',
          '.product-card__rating',
          '.PNcey',
          '*[class*="rating"]', // Added a more general selector
        ]
        const rating =
          findElementContent(product, ratingSelectors, 'content') ||
          findElementContent(product, ratingSelectors) ||
          '0'

        return {
          price,
          priceCurrency,
          prddesc,
          brand,
          rating,
          productHref,
          productId,
        }
      })
    })

    logger.info(`Found ${productsData.length} product elements`)
    return productsData.slice(0, 3) // Return only the first 3 products
  } catch (error) {
    logger.error(`Error in getProductLinks for '${searchTerm}': ${error}`)
    return []
  }
}

// Get best product links
const getBestProductLinks = async (
  page: puppeteer.Page,
  searchTerm: string
): Promise<any[]> => {
  try {
    const productLinks = await getProductLinks(page, searchTerm)

    if (productLinks.length === 0) {
      logger.warning(`No products found for '${searchTerm}'`)
      return []
    }

    const similarities = productLinks.map((product) => ({
      ...product,
      similarity: stringSimilarity(searchTerm, product.prddesc || ''),
    }))

    similarities.sort((a, b) => b.similarity - a.similarity)
    return similarities.slice(0, 3) // Return top 3 most similar products
  } catch (error) {
    logger.error(`Error in getBestProductLinks for '${searchTerm}': ${error}`)
    return []
  }
}

// Main execution
;(async () => {
  const browser = await puppeteerExtra.launch({
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
      '--window-size=878x1899',
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

  try {
    const baseProductURL = 'https://goldapple.ru'
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )

    const csvData = loadCsvFile('urlsall.csv')
    const allProductsData: any[] = []

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      const productName = row['List']
      logger.info(
        `Processing product ${i + 1} of ${csvData.length}: '${productName}'`
      )

      try {
        const productSimilarities = await getBestProductLinks(page, productName)

        if (productSimilarities.length >= 0) {
          productSimilarities.forEach((product, index) => {
            allProductsData.push({
              'Search Criteria': productName,
              'Item Description': product.prddesc,
              Brand: product.brand,
              Rating: product.rating,
              Similarity: product.similarity,
              Price: product.price,
              'Price Currency': product.priceCurrency,
              'Product URL': baseProductURL + product.productHref,
              'Product ID': product.productId,
            })

            csvData[i][`Сходство продукта ${index + 1}`] = product.similarity
            csvData[i][`продукта description ${index + 1}`] = product.prddesc
            csvData[i][`Бренд продукта ${index + 1}`] = product.brand
            csvData[i][`Рейтинг продукта ${index + 1}`] = product.rating
            csvData[i][`ID продукта ${index + 1}`] = product.productId
            csvData[i][`Цена продукта ${index + 1}`] = product.price
            csvData[i][`Валюта цены продукта ${index + 1}`] =
              product.priceCurrency
            csvData[i][`URL изображения продукта ${index + 1}`] =
              baseProductURL + product.productHref

            logger.info(
              `Top ${
                index + 1
              } product for descriptio '${productName}' with the description '${
                product.prddesc
              }' with similarity ${product.similarity}, price ${
                product.price
              }, currency '${product.priceCurrency}', URL ${
                baseProductURL + product.productHref
              }, ID ${product.productId}`
            )
          })
        } else {
          logger.warning(`No valid links found for product '${productName}'.`)
        }
      } catch (error) {
        logger.error(`Error processing product '${productName}': ${error}`)
      }

      // Save progress after each 10 products
      if ((i + 1) % 10 === 0) {
        writeToCsv(
          'progress_найти ссылки на товары_updated.csv',
          csvData,
          Object.keys(csvData[0])
        )
        writeToCsv(
          'progress_productoutput.csv',
          allProductsData,
          Object.keys(allProductsData[0])
        )
        logger.info(`Progress saved after processing ${i + 1} products.`)
      }
    }

    // Save final results
    writeToCsv(
      'найти ссылки на товары_updated.csv',
      csvData,
      Object.keys(csvData[0])
    )
    writeToCsv(
      'productoutput.csv',
      allProductsData,
      Object.keys(allProductsData[0])
    )
    logger.info('Final CSV files saved.')
  } catch (error) {
    logger.error(`An unexpected error occurred: ${error}`)
  } finally {
    await browser.close()
    logger.info('Browser closed and script completed.')
  }
})()

import FirecrawlApp from '@mendable/firecrawl-js'
import { z } from 'zod'

const app = new FirecrawlApp({
  apiKey: 'fc-2fefef7280c241269e655b5fca8b1efe',
})

// Define schema to extract contents into
const schema = z.object({
  Price: z.number(),
  priceCurrency: z.string(),
  brand: z.string(),
  ratingValue: z.number(),
  productURL: z.string(),
  productDesc: z.string(),
})

app.scrapeUrl('https://docs.firecrawl.dev/', {
  formats: ['extract'],
  extract: { schema: schema },
}).then(scrapeResult => {
  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`)
  }
  console.log(scrapeResult.extract)
})

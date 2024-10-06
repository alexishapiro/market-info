import { AppError, catchAsync, logError } from '@/lib/errorUtils'
import { db as prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'
import { NextRequest, NextResponse } from 'next/server'

export const POST = catchAsync(async (request: NextRequest) => {
  const formData = await request.formData()
  const csvFile = formData.get('csvFile') as File
  const baseUrl = formData.get('baseUrl') as string
  const userId = formData.get('userId') as string
  const marketplaceConfigId = formData.get('marketplaceConfigId') as string

  if (!csvFile || !baseUrl || !userId || !marketplaceConfigId) {
    throw new AppError('Missing required fields', 400)
  }

  const csvContent = await csvFile.text()
  const csvProducts = parse(csvContent, { columns: true })

  const job = await prisma.scrapingJob.create({
    data: {
      status: 'QUEUED',
      userId: userId,
      marketplaceConfigId: marketplaceConfigId,
      productList: JSON.stringify(csvProducts),
      results: null,
      errorMessage: null,
      lastRunAt: new Date(),
    }
  })

  // Dynamically import the scraper
  const { scrapeData } = await import('@/lib/scraper')

  // Start the scraping process in the background
  scrapeData(job.id, csvProducts, baseUrl, async (message) => {
    console.log(`Job ${job.id}: ${message}`)
    // ... (keep the rest of the callback implementation)
  })

  return NextResponse.json({ jobId: job.id, status: 'QUEUED' })
})

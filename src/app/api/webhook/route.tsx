import { db as prisma } from '@/lib/prisma'; // Import the Prisma client
import { rateLimiter } from '@/lib/rateLimiter';
import { NextRequest, NextResponse } from 'next/server';

async function handleScrapingJobCompleted(data:any) {
  const { jobId, results } = data

  // Validate required fields
  if (!jobId || !Array.isArray(results)) {
    throw new Error('Missing required fields: jobId or results')
  }

  // Save the results to the database
  await prisma.scrapingJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      scrapedProduct: {
        create: results.map((result) => {
          const { jobId, searchTerm, name, brand, price, rating } = result

          // Validate required fields for each result
          if (!searchTerm || !name) {
            throw new Error(
              'Missing required fields in result: searchTerm or name'
            )
          }

          return {
            jobId,
            name,
            brand,
            price,
            rating,
          }
        }),
      },
    },
  })
}

// Function to handle failed scraping jobs
async function handleScrapingJobFailed(data:any) {
  const { failedJobId } = data

  // Validate required fields
  if (!failedJobId) {
    throw new Error('Missing required field: failedJobId')
  }

  // Update the job status to FAILED
  await prisma.scrapingJob.update({
    where: { id: failedJobId },
    data: { status: 'FAILED' },
  })
}

// Function to handle unknown events
async function handleUnknownEvent(event:any) {
  console.warn('Unhandled event type:', event)
  // You might want to log this to a monitoring service
}

export async function POST(req:any) {
  try {
    const body = await req.json()

    // Validate the webhook payload
    if (!body || !body.event) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    console.log('Received webhook:', body)

    // Process the webhook event
    switch (body.event) {
      case 'scrapingJobCompleted':
        await handleScrapingJobCompleted(body.data)
        break

      case 'scrapingJobFailed':
        await handleScrapingJobFailed(body.data)
        break

      default:
        await handleUnknownEvent(body.event)
        return NextResponse.json(
          { error: 'Unhandled event type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    } else {
      console.error('Unknown error processing webhook:', error)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    } 
  }
}

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ScrapingJob } from '@prisma/client'
import { useFindManyScrapingJob } from '@/lib/hooks/scraping-job'

interface JobsTableProps {
  onJobClick: (jobId: string) => void
}

export function JobsTable({ onJobClick }: JobsTableProps) {
  const [sortField, setSortField] = useState<keyof ScrapingJob>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field as keyof ScrapingJob)
      setSortDirection('asc')
    }
  }

  const {
    data: jobs,
    isLoading,
    error,
  } = useFindManyScrapingJob({
    include: { scrapedProduct: true },
  })

  // if (Array.isArray(result.data)) {
  //   jobs = result.data
  // }

  const downloadCSV = () => {
    if (!jobs || jobs.length === 0) return

    const csvContent = [
      ['ID', 'Status', 'CSV URL', 'Base URL', 'Created At', 'Updated At'],
      ...jobs.map((job) => [
        job.id,
        job.status,
        job.scrapedProduct[0].productUrl,
        job.scrapedProduct[0].name,
        job.createdAt.toISOString(),
        job.updatedAt.toISOString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'scraping_jobs.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (error) return <div>Error</div>
  if (isLoading) return <div>Loading...</div>
  if (!jobs || jobs.length === 0) return <div>No jobs found</div>

  const newLocal = 'scrapedProduct.productUrl'
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Button onClick={downloadCSV}>Download CSV</Button>
      </div>
      {/* <Button onClick={loadJobs}>Load Jobs</Button> */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('id')}>ID</TableHead>
            <TableHead onClick={() => handleSort('status')}>Status</TableHead>
            <TableHead
              onClick={() => {
                return handleSort('scrapedProduct.productUrl')
              }}
            >
              Product URL
            </TableHead>
            <TableHead
              onClick={() => {
                return handleSort('scrapedProduct.name')
              }}
            >
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              onClick={() => onJobClick(job.id)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell>{job.id}</TableCell>
              <TableCell>{job.status}</TableCell>
              <TableCell>{job.scrapedProduct[0].productUrl}</TableCell>
              <TableCell>{job.scrapedProduct[0].name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

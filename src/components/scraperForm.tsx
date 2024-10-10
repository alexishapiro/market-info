
'use client'
import { useState } from 'react'
import { cn, isValidUrl } from '@/lib/utils'
import { JobsTable } from '@/components/jobs-table-component'
import { ProductsTable } from '@/components/products-table-component'
import {
  useFindManyScrapingJob,
  useAggregateScrapingJob,
  useCreateScrapingJob,
  useDeleteScrapingJob,
  useUpdateScrapingJob,
} from '@/lib/api/scraping-job'

import {
  useFindManyScrapedProduct,
  useCreateScrapedProduct,
} from '@/lib/api/scraped-product'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ScraperForm() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState(
    'https://goldapple.ru/catalogsearch/result/?q='
  )
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    data: scrapingJobs,
    isLoading: isLoadingJobs,
    error: errorJobs,
    isValidating: validatingJobs,
    mutate: refreshScrapingJobs,
  } = useFindManyScrapingJob()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile || !isValidUrl(baseUrl)) {
      setLogs((prev) => [
        ...prev,
        'Error: Please select a CSV file and enter a valid base URL',
      ])
      return
    }

    setIsLoading(true)
    setLogs((prev) => [...prev, 'Starting scraping job...'])

    try {
      const formData = new FormData()
      formData.append('csvFile', csvFile)
      formData.append('baseUrl', baseUrl)

      const response = await fetch('/api/scrape', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(
          `Scraping failed: ${response.status} ${response.statusText}`
        )
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = (await reader?.read()) || {}
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        lines.forEach((line) => {
          if (line.trim()) {
            try {
              const logData = JSON.parse(line)
              setLogs((prev) => [...prev, logData.message])
            } catch (error) {
              console.error('Error parsing log:', error)
            }
          }
        })
      }

      setLogs((prev) => [...prev, 'Scraping job completed'])
      refreshScrapingJobs()
    } catch (error) {
      setLogs((prev) => [...prev, `Error: ${(error as Error).message}`])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>Start New Scraping Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="Enter base URL"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(isLoading && 'opacity-50')}
            >
              {isLoading ? 'Scraping...' : 'Start Scraping'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle>Scraping Jobs</CardTitle>
        </CardHeader>
        <CardContent>
            <JobsTable
            onJobClick={(id) => setSelectedJobId(id)}
          />
        </CardContent>
      </Card>

      {selectedJobId && (
        <Card className="bg-accent/20 shadow-lg">
          <CardHeader>
            <CardTitle>Scraped Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsTable
              jobId={selectedJobId}
              basePage="https://goldapple.ru/"
            />
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30 shadow-lg">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="logs"
            value={logs.join('\n')}
            readOnly
            className="h-64"
          />
        </CardContent>
      </Card>
    </div>
  )
}

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
import { ScrapedProduct } from '@prisma/client'
import { useFindManyScrapedProduct } from '@/lib/hooks/scraped-product'

interface ProductsTableProps {
  jobId: string
  basePage: string
}

export function ProductsTable({ jobId, basePage }: ProductsTableProps) {
  const [sortField, setSortField] = useState<keyof ScrapedProduct>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const {
    data: jobProducts,
    isLoading,
    error,
  } = useFindManyScrapedProduct({
    where: {
      scrapingJobId: jobId,
    },
  })

  const handleSort = (field: keyof ScrapedProduct) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const downloadCSV = () => {
    if (!jobProducts) return

    const csvContent = [
      ['ID', 'Name', 'Code', 'Brand', 'Price', 'Rating', 'Created At', 'Link'],
      ...jobProducts.map((product) => [
        product.id,
        product.name,
        product.brand ?? '',
        product.code ?? '',
        product.price || '',
        product.rating || '',
        product.createdAt.toISOString(),
        'https://goldapple.ru/' +'-' +  product.name,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `scraped_products_${jobId}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error)
    return <div>Error: {error.toString() || 'An unknown error occurred'}</div>

  return (
    <div>
      <div className="mb-4 flex justify-between">
        {/* <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        /> */}
        <Button onClick={downloadCSV}>Download CSV</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead onClick={() => handleSort('searchTerm')}>
              Search Term
            </TableHead> */}
            <TableHead onClick={() => handleSort('name')}>Name</TableHead>
            <TableHead onClick={() => handleSort('brand')}>Brand</TableHead>
            <TableHead onClick={() => handleSort('code')}>Code</TableHead>
            <TableHead onClick={() => handleSort('price')}>Price</TableHead>
            <TableHead onClick={() => handleSort('rating')}>Rating</TableHead>
            <TableHead onClick={() => handleSort('createdAt')}>
              Created At
            </TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobProducts?.map((product: ScrapedProduct) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.brand}</TableCell>
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.rating}</TableCell>
              <TableCell>
                {new Date(product.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {basePage + '-' + product.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

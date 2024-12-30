"use client"

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { Download, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { InvoiceDetails } from '@/components/invoice-details'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface Invoice {
  id: string
  invoiceNumber: string
  createdAt: string
  subtotal: number
  totalDiscount: number
  total: number
  items: any[]
  billDiscount?: {
    type: 'percentage' | 'amount'
    value: number
  }
  billDiscountAmount?: number
}

interface DateRange {
  from: Date
  to: Date
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  })

  useEffect(() => {
    if (user) {
      fetchInvoices()
    }
  }, [user])

  useEffect(() => {
    filterInvoices()
  }, [invoices, dateRange])

  const fetchInvoices = async () => {
    if (!user) return

    setLoading(true)
    try {
      const invoicesCollection = collection(db, 'invoices')
      const querySnapshot = await getDocs(invoicesCollection)
      
      const fetchedInvoices = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Invoice))
        .filter(invoice => invoice.userId === user.uid)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setInvoices(fetchedInvoices)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    const filtered = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt)
      return isWithinInterval(invoiceDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      })
    })
    setFilteredInvoices(filtered)
  }

  const downloadExcel = () => {
    try {
      const headers = ['Date', 'Invoice Number', 'Subtotal', 'Discount', 'Total']
      const rows = filteredInvoices.map(invoice => [
        format(new Date(invoice.createdAt), 'dd/MM/yyyy'),
        invoice.invoiceNumber,
        invoice.subtotal.toFixed(2),
        invoice.totalDiscount.toFixed(2),
        invoice.total.toFixed(2)
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `invoices_${format(new Date(), 'dd-MM-yyyy')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading excel:', error)
      toast.error('Failed to download report')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Invoice Reports</h2>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[300px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                            {format(dateRange.to, 'dd/MM/yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'dd/MM/yyyy')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to
                      }}
                      onSelect={(range: any) => {
                        if (range?.from && range?.to) {
                          setDateRange({
                            from: startOfDay(range.from),
                            to: endOfDay(range.to)
                          })
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="secondary"
                  onClick={downloadExcel}
                  disabled={filteredInvoices.length === 0}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted font-medium">
                <div>Date</div>
                <div>Invoice Number</div>
                <div>Subtotal</div>
                <div>Discount</div>
                <div>Total</div>
              </div>
              
              <div className="divide-y">
                {loading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="grid grid-cols-5 gap-4 p-4">
                      <div>{format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</div>
                      <div>
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-primary hover:underline focus:outline-none"
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </div>
                      <div>₹{invoice.subtotal.toFixed(2)}</div>
                      <div className="text-destructive">
                        -₹{invoice.totalDiscount.toFixed(2)}
                      </div>
                      <div className="font-medium">₹{invoice.total.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No invoices found for the selected period
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InvoiceDetails
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  )
}


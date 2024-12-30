"use client"

import { useState, useEffect } from 'react'
import { Plus, Trash2, Printer, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { PrintInvoice } from '@/components/print-invoice'
import { PrintPreview } from '@/components/print-preview'

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  rate: number
  discountedRate: number
  amount: number
}

interface BillDiscount {
  type: 'percentage' | 'amount'
  value: number
}

export default function CreateInvoicePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      name: '',
      quantity: 0,
      rate: 0,
      discountedRate: 0,
      amount: 0
    }
  ])
  const [billDiscount, setBillDiscount] = useState<BillDiscount>({
    type: 'percentage',
    value: 0
  })
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [printerSettings, setPrinterSettings] = useState<any>(null)
  const [companyData, setCompanyData] = useState<any>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchNextInvoiceNumber()
      fetchPrinterSettings()
      fetchCompanyData()
    }
  }, [user])

  const fetchNextInvoiceNumber = async () => {
    if (!user) return

    try {
      const q = query(collection(db, 'invoices'), orderBy('invoiceNumber', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)
      let lastNumber = 0

      if (!querySnapshot.empty) {
        const lastInvoice = querySnapshot.docs[0].data()
        lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]) || 0
      }

      const newNumber = (lastNumber + 1).toString().padStart(4, '0')
      setNextInvoiceNumber(`INV-${newNumber}`)
    } catch (error) {
      console.error('Error fetching next invoice number:', error)
      toast.error('Failed to generate invoice number')
    }
  }

  const fetchPrinterSettings = async () => {
    if (!user) return
    try {
      const settingsDoc = await getDoc(doc(db, 'printerSettings', user.uid))
      if (settingsDoc.exists()) {
        setPrinterSettings(settingsDoc.data())
      }
    } catch (error) {
      console.error('Error fetching printer settings:', error)
      toast.error('Failed to load printer settings')
    }
  }

  const fetchCompanyData = async () => {
    if (!user) return
    try {
      const companyDoc = await getDoc(doc(db, 'companies', user.uid))
      if (companyDoc.exists()) {
        setCompanyData(companyDoc.data())
      }
    } catch (error) {
      console.error('Error fetching company data:', error)
      toast.error('Failed to load company data')
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        quantity: 0,
        rate: 0,
        discountedRate: 0,
        amount: 0
      }
    ])
  }

  const deleteItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate' || field === 'discountedRate') {
          updatedItem.amount = updatedItem.quantity * (updatedItem.discountedRate || updatedItem.rate)
        }
        return updatedItem
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  }

  const calculateItemDiscounts = () => {
    return items.reduce((sum, item) => {
      const regularTotal = item.quantity * item.rate
      const discountedTotal = item.quantity * (item.discountedRate || item.rate)
      return sum + (regularTotal - discountedTotal)
    }, 0)
  }

  const calculateBillDiscount = () => {
    const subtotal = calculateSubtotal()
    const itemDiscounts = calculateItemDiscounts()
    const afterItemDiscounts = subtotal - itemDiscounts

    if (billDiscount.type === 'percentage') {
      return (afterItemDiscounts * billDiscount.value) / 100
    }
    return billDiscount.value
  }

  const calculateTotalDiscount = () => {
    return calculateItemDiscounts() + calculateBillDiscount()
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const totalDiscount = calculateTotalDiscount()
    return subtotal - totalDiscount
  }

  const handleSave = async (shouldPrint: boolean = false) => {
    if (!user || !nextInvoiceNumber || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      const invoiceData = {
        invoiceNumber: nextInvoiceNumber,
        userId: user.uid,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          discountedRate: item.discountedRate,
          amount: item.amount
        })),
        billDiscount,
        subtotal: calculateSubtotal(),
        itemDiscounts: calculateItemDiscounts(),
        billDiscountAmount: calculateBillDiscount(),
        totalDiscount: calculateTotalDiscount(),
        totalSavings: calculateTotalDiscount(),
        total: calculateTotal(),
        createdAt: new Date().toISOString(),
        status: 'completed'
      }

      const docRef = await addDoc(collection(db, 'invoices'), invoiceData)
      toast.success('Invoice saved successfully!')

      if (shouldPrint) {
        setCurrentInvoice(invoiceData)
        setShowPrintModal(true)
      }

      // Reset form and fetch next invoice number
      setItems([{
        id: '1',
        name: '',
        quantity: 0,
        rate: 0,
        discountedRate: 0,
        amount: 0
      }])
      setBillDiscount({ type: 'percentage', value: 0 })
      
      // Generate next invoice number
      const newNumber = (parseInt(nextInvoiceNumber.split('-')[1]) + 1).toString().padStart(4, '0')
      setNextInvoiceNumber(`INV-${newNumber}`)

    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error('Failed to save invoice')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Invoice</CardTitle>
          <div className="text-sm text-muted-foreground">
            Invoice #: {nextInvoiceNumber}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Items Table */}
            <div className="border rounded-lg">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted font-medium">
                <div className="col-span-4">Item Name</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Discounted Rate</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-4">
                      <Input
                        placeholder="Enter item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.rate || ''}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.discountedRate || ''}
                        onChange={(e) => updateItem(item.id, 'discountedRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 font-medium">
                      ₹{item.amount.toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Item Button */}
            <Button onClick={addItem} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            {/* Totals and Additional Discount */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between">
                <Label>Subtotal:</Label>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Label>Additional Discount:</Label>
                  <Select
                    value={billDiscount.type}
                    onValueChange={(value: 'percentage' | 'amount') => 
                      setBillDiscount(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    value={billDiscount.value || ''}
                    onChange={(e) => setBillDiscount(prev => ({ 
                      ...prev, 
                      value: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-[120px]"
                  />
                </div>
                <span className="font-medium text-destructive">
                  -₹{calculateBillDiscount().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-destructive">
                <Label>Total Discount:</Label>
                <span className="font-medium">-₹{calculateTotalDiscount().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-green-500">
                <Label>Total Savings:</Label>
                <span className="font-medium">₹{calculateTotalDiscount().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <Label>Total:</Label>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleSave()}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Bill'}
                </Button>
                <Button 
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save & Print'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPrintModal && (
        <PrintInvoice
          invoice={currentInvoice}
          printerSettings={printerSettings}
          companyData={companyData}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  )
}


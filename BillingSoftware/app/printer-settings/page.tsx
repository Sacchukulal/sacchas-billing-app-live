"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PrintPreview } from '@/components/print-preview'

interface PrinterSettings {
  printerType: 'thermal' | 'laser'
  paperSize: string
  fontSize: 'small' | 'medium' | 'large'
  invoiceFields: {
    [key: string]: boolean
  }
  customContent: {
    thankYouMessage: string
    termsAndConditions: string
    customNotes: string
  }
}

const defaultSettings: PrinterSettings = {
  printerType: 'thermal',
  paperSize: '3inch',
  fontSize: 'medium',
  invoiceFields: {
    companyName: true,
    companyAddress: true,
    phoneNumber: true,
    email: true,
    gstNumber: true,
    invoiceTitle: true,
    invoiceNumber: true,
    invoiceDate: true,
    clientName: true,
    itemQuantity: true,
    itemRate: true,
    itemAmount: true,
    subtotal: true,
    discount: true,
    total: true,
    savedAmount: true,
    separatorLines: true,
    barcodeQR: true,
    paymentMode: true,
    termsAndConditions: true,
    customNotes: true,
    thankYouMessage: true,
  },
  customContent: {
    thankYouMessage: 'Thank you for your business!',
    termsAndConditions: '1. All sales are final\n2. Returns accepted within 7 days\n3. Please keep your bill for warranty',
    customNotes: ''
  }
}

const invoiceFieldsList = [
  { id: 'companyName', label: 'Company Name' },
  { id: 'companyAddress', label: 'Company Address' },
  { id: 'phoneNumber', label: 'Phone Number' },
  { id: 'email', label: 'Email' },
  { id: 'gstNumber', label: 'GST Number' },
  { id: 'invoiceTitle', label: 'Invoice Title' },
  { id: 'invoiceNumber', label: 'Invoice Number' },
  { id: 'invoiceDate', label: 'Invoice Date' },
  { id: 'clientName', label: 'Client Name' },
  { id: 'itemQuantity', label: 'Item Quantity' },
  { id: 'itemRate', label: 'Item Rate' },
  { id: 'itemAmount', label: 'Item Amount' },
  { id: 'subtotal', label: 'Subtotal' },
  { id: 'discount', label: 'Discount' },
  { id: 'savedAmount', label: 'Saved Amount' },
  { id: 'total', label: 'Total' },
  { id: 'separatorLines', label: 'Separator Lines' },
  { id: 'barcodeQR', label: 'Barcode/QR Code' },
  { id: 'paymentMode', label: 'Payment Mode' },
  { id: 'termsAndConditions', label: 'Terms and Conditions' },
  { id: 'customNotes', label: 'Custom Notes' },
  { id: 'thankYouMessage', label: 'Thank You Message' },
]

export default function PrinterSettings() {
  const [settings, setSettings] = useState<PrinterSettings>(defaultSettings)
  const [companyData, setCompanyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        const settingsDoc = await getDoc(doc(db, 'printerSettings', user.uid))
        if (settingsDoc.exists()) {
          const fetchedSettings = settingsDoc.data()
          // Merge fetched settings with default settings to ensure all properties exist
          setSettings({
            ...defaultSettings,
            ...fetchedSettings,
            customContent: {
              ...defaultSettings.customContent,
              ...(fetchedSettings.customContent || {})
            },
            invoiceFields: {
              ...defaultSettings.invoiceFields,
              ...(fetchedSettings.invoiceFields || {})
            }
          })
        }

        const companyDoc = await getDoc(doc(db, 'companies', user.uid))
        if (companyDoc.exists()) {
          setCompanyData(companyDoc.data())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load settings')
      }
    }

    fetchData()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      await setDoc(doc(db, 'printerSettings', user.uid), settings)
      toast.success('Printer settings saved successfully!')
    } catch (error) {
      console.error('Error saving printer settings:', error)
      toast.error('Failed to save printer settings')
    } finally {
      setLoading(false)
    }
  }

  const getPaperSizeOptions = () => {
    if (settings.printerType === 'thermal') {
      return [
        { value: '3inch', label: '3 inch' },
        { value: '4inch', label: '4 inch' },
      ]
    }
    return [
      { value: 'A4', label: 'A4' },
      { value: 'A5', label: 'A5' },
    ]
  }

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Printer Type</Label>
              <RadioGroup
                value={settings.printerType}
                onValueChange={(value: 'thermal' | 'laser') => {
                  setSettings(prev => ({
                    ...prev,
                    printerType: value,
                    paperSize: value === 'thermal' ? '3inch' : 'A4'
                  }))
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="thermal" id="thermal" />
                  <Label htmlFor="thermal">Thermal Printer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="laser" id="laser" />
                  <Label htmlFor="laser">Laser Printer</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Paper Size</Label>
              <Select
                value={settings.paperSize}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, paperSize: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent>
                  {getPaperSizeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Font Size</Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value: 'small' | 'medium' | 'large') => 
                  setSettings(prev => ({ ...prev, fontSize: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {invoiceFieldsList.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={settings.invoiceFields[field.id]}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        invoiceFields: {
                          ...prev.invoiceFields,
                          [field.id]: checked === true
                        }
                      }))
                    }
                  />
                  <Label htmlFor={field.id}>{field.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.invoiceFields.thankYouMessage && (
              <div className="space-y-2">
                <Label htmlFor="thankYouMessage">Thank You Message</Label>
                <Textarea
                  id="thankYouMessage"
                  value={settings.customContent?.thankYouMessage || ''}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      customContent: {
                        ...prev.customContent,
                        thankYouMessage: e.target.value
                      }
                    }))
                  }
                  placeholder="Enter thank you message"
                  className="min-h-[60px]"
                />
              </div>
            )}

            {settings.invoiceFields.termsAndConditions && (
              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={settings.customContent?.termsAndConditions || ''}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      customContent: {
                        ...prev.customContent,
                        termsAndConditions: e.target.value
                      }
                    }))
                  }
                  placeholder="Enter terms and conditions"
                  className="min-h-[100px]"
                />
              </div>
            )}

            {settings.invoiceFields.customNotes && (
              <div className="space-y-2">
                <Label htmlFor="customNotes">Custom Notes</Label>
                <Textarea
                  id="customNotes"
                  value={settings.customContent?.customNotes || ''}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      customContent: {
                        ...prev.customContent,
                        customNotes: e.target.value
                      }
                    }))
                  }
                  placeholder="Enter custom notes"
                  className="min-h-[60px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="sticky top-6">
        <Card>
          <CardHeader>
            <CardTitle>Print Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <PrintPreview
              settings={settings}
              companyData={companyData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


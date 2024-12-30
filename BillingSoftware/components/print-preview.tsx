import { format } from 'date-fns'
import { QrCode } from 'lucide-react'

interface PrintPreviewProps {
  settings: {
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
  companyData: any
  invoice?: any
}

export function PrintPreview({ settings, companyData, invoice }: PrintPreviewProps) {
  // Define sample invoice data for preview
  const sampleInvoiceData = {
    invoiceNumber: 'INV-0001',
    date: new Date(),
    createdAt: new Date().toISOString(),
    clientName: 'Sample Client',
    items: [
      { name: 'Item 1', quantity: 2, rate: 100, amount: 200 },
      { name: 'Item 2', quantity: 1, rate: 150, amount: 150 },
    ],
    subtotal: 350,
    discount: 35,
    total: 315,
    paymentMode: 'Cash',
  }

  // Use actual invoice data if provided, otherwise use sample data
  const invoiceData = invoice || sampleInvoiceData

  if (!companyData) {
    return (
      <div className="text-center text-muted-foreground">
        Please set up your company information first.
      </div>
    )
  }

  const getFontSize = (base: number) => {
    const sizes = {
      small: base * 0.875,
      medium: base,
      large: base * 1.125
    }
    return `${sizes[settings.fontSize]}px`
  }

  const Separator = () => (
    settings.invoiceFields.separatorLines ? (
      <div className="my-4 border-t border-dashed" />
    ) : (
      <div className="my-4" />
    )
  )

  const ThermalPreview = () => (
    <div 
      className={`mx-auto bg-white p-4 ${settings.paperSize === '3inch' ? 'w-[3in]' : 'w-[4in]'}`}
      style={{ fontSize: getFontSize(12) }}
    >
      <div className="space-y-2 text-center">
        {settings.invoiceFields.companyName && (
          <div className="font-bold" style={{ fontSize: getFontSize(14) }}>{companyData.name}</div>
        )}
        {settings.invoiceFields.companyAddress && (
          <div>{companyData.address}</div>
        )}
        {settings.invoiceFields.phoneNumber && (
          <div>Phone: {companyData.phone}</div>
        )}
        {settings.invoiceFields.email && (
          <div>Email: {companyData.email}</div>
        )}
        {settings.invoiceFields.gstNumber && (
          <div>GSTIN: {companyData.gstin}</div>
        )}
      </div>

      <Separator />

      {settings.invoiceFields.invoiceTitle && (
        <div className="text-center font-bold">TAX INVOICE</div>
      )}

      <div className="mt-2 space-y-1">
        {settings.invoiceFields.invoiceNumber && (
          <div>Invoice No: {invoiceData.invoiceNumber}</div>
        )}
        {settings.invoiceFields.invoiceDate && (
          <div>Date: {format(new Date(invoiceData.createdAt || invoiceData.date), 'dd/MM/yyyy')}</div>
        )}
        {settings.invoiceFields.clientName && (
          <div>Customer: {invoiceData.clientName}</div>
        )}
      </div>

      <Separator />

      {/* Items Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left">Item</th>
            {settings.invoiceFields.itemQuantity && <th className="text-right">Qty</th>}
            {settings.invoiceFields.itemRate && <th className="text-right">Rate</th>}
            {settings.invoiceFields.itemAmount && <th className="text-right">Amt</th>}
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item: any, index: number) => (
            <tr key={index} className="border-b">
              <td>{item.name}</td>
              {settings.invoiceFields.itemQuantity && (
                <td className="text-right">{item.quantity}</td>
              )}
              {settings.invoiceFields.itemRate && (
                <td className="text-right">{item.rate}</td>
              )}
              {settings.invoiceFields.itemAmount && (
                <td className="text-right">{item.amount}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 space-y-1">
        {settings.invoiceFields.subtotal && (
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{invoiceData.subtotal}</span>
          </div>
        )}
        {settings.invoiceFields.discount && invoiceData.totalDiscount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>₹{invoiceData.totalDiscount || invoiceData.discount}</span>
          </div>
        )}
        {settings.invoiceFields.savedAmount && (invoiceData.totalSavings || invoiceData.discount) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>You Saved:</span>
            <span>₹{invoiceData.totalSavings || invoiceData.discount}</span>
          </div>
        )}
        {settings.invoiceFields.total && (
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{invoiceData.total}</span>
          </div>
        )}
      </div>

      {settings.invoiceFields.paymentMode && invoiceData.paymentMode && (
        <div className="mt-2">
          Payment Mode: {invoiceData.paymentMode}
        </div>
      )}

      {settings.invoiceFields.barcodeQR && (
        <div className="flex justify-center my-4">
          <QrCode className="h-24 w-24" />
        </div>
      )}

      {settings.invoiceFields.termsAndConditions && settings.customContent?.termsAndConditions && (
        <>
          <Separator />
          <div className="text-xs whitespace-pre-line">
            {settings.customContent.termsAndConditions}
          </div>
        </>
      )}

      {settings.invoiceFields.customNotes && settings.customContent?.customNotes && (
        <>
          <Separator />
          <div className="text-xs italic">
            {settings.customContent.customNotes}
          </div>
        </>
      )}

      {settings.invoiceFields.thankYouMessage && settings.customContent?.thankYouMessage && (
        <>
          <Separator />
          <div className="text-center">
            {settings.customContent.thankYouMessage}
          </div>
        </>
      )}
    </div>
  )

  const LaserPreview = () => (
    <div 
      className={`mx-auto bg-white p-8 ${settings.paperSize === 'A4' ? 'w-[8.27in]' : 'w-[5.83in]'}`}
      style={{ fontSize: getFontSize(14) }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between">
          <div className="space-y-1">
            {settings.invoiceFields.companyName && (
              <div className="text-xl font-bold">{companyData.name}</div>
            )}
            {settings.invoiceFields.companyAddress && (
              <div className="text-gray-600">{companyData.address}</div>
            )}
            {settings.invoiceFields.phoneNumber && (
              <div>Phone: {companyData.phone}</div>
            )}
            {settings.invoiceFields.email && (
              <div>Email: {companyData.email}</div>
            )}
          </div>
          {settings.invoiceFields.gstNumber && (
            <div>
              <div className="font-semibold">GSTIN</div>
              <div>{companyData.gstin}</div>
            </div>
          )}
        </div>

        {/* Title */}
        {settings.invoiceFields.invoiceTitle && (
          <div className="text-2xl font-bold text-center my-6">TAX INVOICE</div>
        )}

        {/* Invoice Info */}
        <div className="flex justify-between">
          <div className="space-y-1">
            {settings.invoiceFields.clientName && (
              <div>
                <span className="font-semibold">Bill To:</span>
                <div className="mt-1">{invoiceData.clientName}</div>
              </div>
            )}
          </div>
          <div className="space-y-1 text-right">
            {settings.invoiceFields.invoiceNumber && (
              <div>
                <span className="font-semibold">Invoice No:</span>{' '}
                {invoiceData.invoiceNumber}
              </div>
            )}
            {settings.invoiceFields.invoiceDate && (
              <div>
                <span className="font-semibold">Date:</span>{' '}
                {format(new Date(invoiceData.createdAt || invoiceData.date), 'dd/MM/yyyy')}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mt-6">
          <thead>
            <tr className={settings.invoiceFields.separatorLines ? "border-y" : ""}>
              <th className="py-2 text-left">Item Description</th>
              {settings.invoiceFields.itemQuantity && (
                <th className="py-2 text-right">Quantity</th>
              )}
              {settings.invoiceFields.itemRate && (
                <th className="py-2 text-right">Rate</th>
              )}
              {settings.invoiceFields.itemAmount && (
                <th className="py-2 text-right">Amount</th>
              )}
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item: any, index: number) => (
              <tr key={index} className={settings.invoiceFields.separatorLines ? "border-b" : ""}>
                <td className="py-2">{item.name}</td>
                {settings.invoiceFields.itemQuantity && (
                  <td className="py-2 text-right">{item.quantity}</td>
                )}
                {settings.invoiceFields.itemRate && (
                  <td className="py-2 text-right">₹{item.rate}</td>
                )}
                {settings.invoiceFields.itemAmount && (
                  <td className="py-2 text-right">₹{item.amount}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-72 space-y-2">
          {settings.invoiceFields.subtotal && (
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoiceData.subtotal}</span>
            </div>
          )}
          {settings.invoiceFields.discount && (invoiceData.totalDiscount || invoiceData.discount) > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>₹{invoiceData.totalDiscount || invoiceData.discount}</span>
            </div>
          )}
          {settings.invoiceFields.savedAmount && (invoiceData.totalSavings || invoiceData.discount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>You Saved:</span>
              <span>₹{invoiceData.totalSavings || invoiceData.discount}</span>
            </div>
          )}
          {settings.invoiceFields.total && (
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total:</span>
              <span>₹{invoiceData.total}</span>
            </div>
          )}
        </div>

        {settings.invoiceFields.paymentMode && invoiceData.paymentMode && (
          <div className="mt-4">
            <span className="font-semibold">Payment Mode:</span> {invoiceData.paymentMode}
          </div>
        )}

        <div className="flex justify-between items-end mt-8">
          {settings.invoiceFields.barcodeQR && (
            <div>
              <QrCode className="h-24 w-24" />
            </div>
          )}
          <div className="space-y-4 flex-1 ml-8">
            {settings.invoiceFields.termsAndConditions && settings.customContent?.termsAndConditions && (
              <div>
                <div className="font-semibold mb-1">Terms and Conditions:</div>
                <div className="text-sm whitespace-pre-line">
                  {settings.customContent.termsAndConditions}
                </div>
              </div>
            )}

            {settings.invoiceFields.customNotes && settings.customContent?.customNotes && (
              <div className="text-sm italic">
                {settings.customContent.customNotes}
              </div>
            )}
          </div>
        </div>

        {settings.invoiceFields.thankYouMessage && settings.customContent?.thankYouMessage && (
          <div className="mt-8 text-center">
            {settings.customContent.thankYouMessage}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
      {settings.printerType === 'thermal' ? <ThermalPreview /> : <LaserPreview />}
    </div>
  )
}


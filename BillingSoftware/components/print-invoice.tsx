import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { QrCode } from 'lucide-react'

interface PrintInvoiceProps {
  invoice: any
  printerSettings: any
  companyData: any
  onClose: () => void
}

export function PrintInvoice({ invoice, printerSettings, companyData, onClose }: PrintInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (printRef.current) {
      // Create print-specific styles
      const style = document.createElement('style')
      style.innerHTML = `
        @media print {
          @page {
            margin: 0;
            size: ${printerSettings.printerType === 'thermal' 
              ? (printerSettings.paperSize === '3inch' ? '3in auto' : '4in auto')
              : (printerSettings.paperSize === 'A4' ? 'A4 portrait' : 'A5 portrait')};
          }
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: ${printerSettings.printerType === 'thermal'
              ? (printerSettings.paperSize === '3inch' ? '3in' : '4in')
              : (printerSettings.paperSize === 'A4' ? '210mm' : '148mm')};
            margin: 0 !important;
            padding: ${printerSettings.printerType === 'thermal' ? '0.2in' : '0.4in'} !important;
          }
          .preview-container {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `
      document.head.appendChild(style)

      // Print the document
      window.print()

      // Clean up
      document.head.removeChild(style)
      onClose()
    }
  }, [onClose, printerSettings])

  const getFontSize = (base: number) => {
    const sizes = {
      small: base * 0.875,
      medium: base,
      large: base * 1.125
    }
    return `${sizes[printerSettings.fontSize]}px`
  }

  const Separator = () => (
    printerSettings.invoiceFields.separatorLines ? (
      <div className="my-2 border-t border-dashed" />
    ) : (
      <div className="my-2" />
    )
  )

  return (
    <div ref={printRef}>
      <div id="print-content" className="bg-white">
        {printerSettings.printerType === 'thermal' ? (
          <div style={{ 
            width: printerSettings.paperSize === '3inch' ? '3in' : '4in',
            fontSize: getFontSize(12),
            lineHeight: '1.2'
          }}>
            <div className="text-center space-y-1">
              {printerSettings.invoiceFields.companyName && (
                <div className="font-bold" style={{ fontSize: getFontSize(14) }}>
                  {companyData.name}
                </div>
              )}
              {printerSettings.invoiceFields.companyAddress && (
                <div>{companyData.address}</div>
              )}
              {printerSettings.invoiceFields.phoneNumber && (
                <div>Phone: {companyData.phone}</div>
              )}
              {printerSettings.invoiceFields.email && (
                <div>Email: {companyData.email}</div>
              )}
              {printerSettings.invoiceFields.gstNumber && (
                <div>GSTIN: {companyData.gstin}</div>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              {printerSettings.invoiceFields.invoiceNumber && (
                <div>Invoice No: {invoice.invoiceNumber}</div>
              )}
              {printerSettings.invoiceFields.invoiceDate && (
                <div>Date: {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</div>
              )}
            </div>

            <Separator />

            <table className="w-full text-left" style={{ fontSize: getFontSize(12) }}>
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  {printerSettings.invoiceFields.itemQuantity && (
                    <th className="text-right">Qty</th>
                  )}
                  {printerSettings.invoiceFields.itemRate && (
                    <th className="text-right">Rate</th>
                  )}
                  {printerSettings.invoiceFields.itemAmount && (
                    <th className="text-right">Amt</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    {printerSettings.invoiceFields.itemQuantity && (
                      <td className="text-right">{item.quantity}</td>
                    )}
                    {printerSettings.invoiceFields.itemRate && (
                      <td className="text-right">{item.rate}</td>
                    )}
                    {printerSettings.invoiceFields.itemAmount && (
                      <td className="text-right">{item.amount}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator />

            <div className="space-y-1">
              {printerSettings.invoiceFields.subtotal && (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
              )}
              {printerSettings.invoiceFields.discount && invoice.totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>₹{invoice.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {printerSettings.invoiceFields.savedAmount && invoice.totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You Saved:</span>
                  <span>₹{invoice.totalSavings.toFixed(2)}</span>
                </div>
              )}
              {printerSettings.invoiceFields.total && (
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{invoice.total.toFixed(2)}</span>
                </div>
              )}
            </div>

            {printerSettings.invoiceFields.termsAndConditions && 
             printerSettings.customContent?.termsAndConditions && (
              <>
                <Separator />
                <div className="text-xs whitespace-pre-line">
                  {printerSettings.customContent.termsAndConditions}
                </div>
              </>
            )}

            {printerSettings.invoiceFields.customNotes && 
             printerSettings.customContent?.customNotes && (
              <>
                <Separator />
                <div className="text-xs italic">
                  {printerSettings.customContent.customNotes}
                </div>
              </>
            )}

            {printerSettings.invoiceFields.thankYouMessage && 
             printerSettings.customContent?.thankYouMessage && (
              <>
                <Separator />
                <div className="text-center">
                  {printerSettings.customContent.thankYouMessage}
                </div>
              </>
            )}
          </div>
        ) : (
          // Laser printer layout
          <div style={{ 
            width: printerSettings.paperSize === 'A4' ? '210mm' : '148mm',
            fontSize: getFontSize(14)
          }}>
            {/* Laser printer content - similar structure but with different styling */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="space-y-1">
                  {printerSettings.invoiceFields.companyName && (
                    <div className="text-xl font-bold">{companyData.name}</div>
                  )}
                  {printerSettings.invoiceFields.companyAddress && (
                    <div>{companyData.address}</div>
                  )}
                  {printerSettings.invoiceFields.phoneNumber && (
                    <div>Phone: {companyData.phone}</div>
                  )}
                  {printerSettings.invoiceFields.email && (
                    <div>Email: {companyData.email}</div>
                  )}
                </div>
                {printerSettings.invoiceFields.gstNumber && (
                  <div>
                    <div className="font-semibold">GSTIN</div>
                    <div>{companyData.gstin}</div>
                  </div>
                )}
              </div>

              {printerSettings.invoiceFields.invoiceTitle && (
                <div className="text-2xl font-bold text-center my-6">TAX INVOICE</div>
              )}

              <div className="flex justify-between">
                <div>
                  {printerSettings.invoiceFields.invoiceNumber && (
                    <div>Invoice No: {invoice.invoiceNumber}</div>
                  )}
                  {printerSettings.invoiceFields.invoiceDate && (
                    <div>Date: {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</div>
                  )}
                </div>
              </div>

              <table className="w-full mt-4">
                <thead>
                  <tr className={printerSettings.invoiceFields.separatorLines ? "border-y" : ""}>
                    <th className="py-2 text-left">Item</th>
                    {printerSettings.invoiceFields.itemQuantity && (
                      <th className="text-right">Qty</th>
                    )}
                    {printerSettings.invoiceFields.itemRate && (
                      <th className="text-right">Rate</th>
                    )}
                    {printerSettings.invoiceFields.itemAmount && (
                      <th className="text-right">Amount</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any, index: number) => (
                    <tr key={index} className={printerSettings.invoiceFields.separatorLines ? "border-b" : ""}>
                      <td className="py-1">{item.name}</td>
                      {printerSettings.invoiceFields.itemQuantity && (
                        <td className="text-right">{item.quantity}</td>
                      )}
                      {printerSettings.invoiceFields.itemRate && (
                        <td className="text-right">{item.rate}</td>
                      )}
                      {printerSettings.invoiceFields.itemAmount && (
                        <td className="text-right">{item.amount}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 ml-auto w-72 space-y-2">
                {printerSettings.invoiceFields.subtotal && (
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {printerSettings.invoiceFields.discount && invoice.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>₹{invoice.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {printerSettings.invoiceFields.savedAmount && invoice.totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Saved:</span>
                    <span>₹{invoice.totalSavings.toFixed(2)}</span>
                  </div>
                )}
                {printerSettings.invoiceFields.total && (
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total:</span>
                    <span>₹{invoice.total.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {(printerSettings.invoiceFields.termsAndConditions || 
                printerSettings.invoiceFields.customNotes) && (
                <div className="mt-8 space-y-4">
                  {printerSettings.invoiceFields.termsAndConditions && 
                   printerSettings.customContent?.termsAndConditions && (
                    <div>
                      <div className="font-semibold mb-1">Terms and Conditions:</div>
                      <div className="text-sm whitespace-pre-line">
                        {printerSettings.customContent.termsAndConditions}
                      </div>
                    </div>
                  )}

                  {printerSettings.invoiceFields.customNotes && 
                   printerSettings.customContent?.customNotes && (
                    <div className="text-sm italic">
                      {printerSettings.customContent.customNotes}
                    </div>
                  )}
                </div>
              )}

              {printerSettings.invoiceFields.thankYouMessage && 
               printerSettings.customContent?.thankYouMessage && (
                <div className="mt-8 text-center">
                  {printerSettings.customContent.thankYouMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


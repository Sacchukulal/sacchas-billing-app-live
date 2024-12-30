import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface InvoiceDetailsProps {
  invoice: any
  isOpen: boolean
  onClose: () => void
}

export function InvoiceDetails({ invoice, isOpen, onClose }: InvoiceDetailsProps) {
  if (!invoice) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Details - {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-5 gap-4 p-3 bg-muted font-medium text-sm">
              <div>Item Name</div>
              <div>Quantity</div>
              <div>Rate</div>
              <div>Discounted Rate</div>
              <div>Amount</div>
            </div>
            <div className="divide-y">
              {invoice.items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-5 gap-4 p-3 text-sm">
                  <div>{item.name}</div>
                  <div>{item.quantity}</div>
                  <div>₹{item.rate.toFixed(2)}</div>
                  <div>{item.discountedRate ? `₹${item.discountedRate.toFixed(2)}` : '-'}</div>
                  <div>₹{item.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            
            {invoice.billDiscount && invoice.billDiscount.value > 0 && (
              <div className="flex justify-between text-destructive">
                <span>
                  Additional Discount 
                  ({invoice.billDiscount.type === 'percentage' ? 
                    `${invoice.billDiscount.value}%` : 
                    `₹${invoice.billDiscount.value}`}):
                </span>
                <span>-₹{(invoice.billDiscountAmount || 0).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-destructive">
              <span>Total Discount:</span>
              <span>-₹{invoice.totalDiscount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-green-500">
              <span>Total Savings:</span>
              <span>₹{invoice.totalDiscount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-medium text-base pt-2 border-t">
              <span>Total:</span>
              <span>₹{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


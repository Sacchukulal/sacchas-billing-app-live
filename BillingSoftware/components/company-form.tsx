"use client"

import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Building2, Building, Phone, Mail, Receipt, CreditCard, QrCode } from 'lucide-react'

interface CompanyData {
  // Company Details
  name: string
  address: string
  email: string
  phone: string
  gstin: string
  pan: string
  website: string
  // Bank Details
  bankName: string
  accountNumber: string
  ifscCode: string
  upiId: string
  additionalInfo: string
}

const initialCompanyData: CompanyData = {
  name: '',
  address: '',
  email: '',
  phone: '',
  gstin: '',
  pan: '',
  website: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
  additionalInfo: ''
}

export function CompanyForm() {
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData)
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchCompanyData() {
      if (!user) return

      try {
        const docRef = doc(db, 'companies', user.uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setCompanyData(docSnap.data() as CompanyData)
        }
      } catch (error) {
        console.error('Error fetching company data:', error)
        toast.error('Failed to load company information')
      } finally {
        setIsFetching(false)
      }
    }

    fetchCompanyData()
  }, [user])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setCompanyData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await setDoc(doc(db, 'companies', user.uid), {
        ...companyData,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      })
      toast.success('Company information saved successfully!')
    } catch (error) {
      console.error('Error saving company data:', error)
      toast.error('Failed to save company information')
    } finally {
      setLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Company Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details
          </CardTitle>
          <CardDescription>
            Enter your company details. This information will appear on your invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="name"
                name="name"
                value={companyData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={companyData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={companyData.address}
              onChange={handleInputChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={companyData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={companyData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstin" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                GSTIN
              </Label>
              <Input
                id="gstin"
                name="gstin"
                value={companyData.gstin}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input
                id="pan"
                name="pan"
                value={companyData.pan}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Details
          </CardTitle>
          <CardDescription>
            Enter your bank account details for payment information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                value={companyData.bankName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={companyData.accountNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                name="ifscCode"
                value={companyData.ifscCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                UPI ID
              </Label>
              <Input
                id="upiId"
                name="upiId"
                value={companyData.upiId}
                onChange={handleInputChange}
                placeholder="username@upi"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              value={companyData.additionalInfo}
              onChange={handleInputChange}
              placeholder="Any additional information you want to include"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="ml-auto">
            {loading ? 'Saving...' : 'Save Company Information'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}


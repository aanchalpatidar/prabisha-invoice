import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { FileText, Receipt, Building2, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice & Quotation Generator</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Professional invoicing made simple</p>
          </div>
          <CurrencySwitcher />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                Create Invoice
              </CardTitle>
              <CardDescription>Generate professional invoices for your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/invoices/create">
                <Button className="w-full">Create Invoice</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Create Quotation
              </CardTitle>
              <CardDescription>Create detailed quotations for potential clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quotations/create">
                <Button className="w-full">Create Quotation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Company Setup
              </CardTitle>
              <CardDescription>Configure your company details and branding</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/company">
                <Button variant="outline" className="w-full">
                  Setup Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/invoices">
                  <Button variant="ghost" className="w-full justify-start">
                    View All Invoices
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/customers">
                  <Button variant="ghost" className="w-full justify-start">
                    Manage Customers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

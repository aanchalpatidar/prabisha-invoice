"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { FileText, Receipt, Building2, Users, BarChart3, Pencil } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [company, setCompany] = useState<any>(null);
  
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/company").then(res => res.json()).then(setCompany);
    }
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Quick access to all features</p>
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
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>View business analytics and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports">
                <Button className="w-full">View Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {company && company.name ? (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                {company.name}
              </CardTitle>
              <CardDescription>Your Company Details</CardDescription>
            </CardHeader>
            <CardContent>
              {company.logoUrl && (
                <img src={company.logoUrl} alt="Logo" className="h-12 mb-2 object-contain" style={{ maxWidth: 120 }} />
              )}
              <div className="mb-2 text-sm text-gray-700">
                <div><span className="font-semibold">Email:</span> {company.email}</div>
                <div><span className="font-semibold">Phone:</span> {company.phone}</div>
                <div><span className="font-semibold">Address:</span> <span className="whitespace-pre-line">{company.address}</span></div>
                {company.taxNumber && <div><span className="font-semibold">Tax ID:</span> {company.taxNumber}</div>}
              </div>
              <Link href="/company">
                <Button variant="outline" className="w-full mt-2 flex items-center gap-2">
                  <Pencil className="h-4 w-4" /> Edit Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
  );
} 
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, Building2, Users, BarChart3, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col font-poppins">
      <header className="py-10 px-4 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 dark:text-white mb-4 drop-shadow-lg">Prabisha Invoice</h1>
          <p className="text-2xl text-gray-700 dark:text-gray-200 mb-6 max-w-xl">Professional, modern invoicing and quotation software for growing businesses.</p>
          <Link href="/dashboard">
            <Button size="lg" className="mt-2 text-lg px-8 py-4 shadow-lg">Go to Dashboard</Button>
          </Link>
        </div>
        <img src="/placeholder-logo.png" alt="Prabisha Logo" className="h-32 md:h-48 rounded-xl shadow-lg bg-white p-4" />
      </header>
      <main className="flex-1 px-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
          <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Receipt className="h-6 w-6 text-blue-600" /> Create Invoices</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-200">Generate professional invoices in seconds, with your branding and dynamic currency support.</CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-6 w-6 text-green-600" /> Create Quotations</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-200">Send detailed quotations to clients and convert them to invoices with one click.</CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Building2 className="h-6 w-6 text-purple-600" /> Company Branding</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-200">Customize your company details, logo, and color scheme for a professional look.</CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-white/80 dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><BarChart3 className="h-6 w-6 text-orange-600" /> Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-200">Track revenue, top customers, and download reports in CSV/Excel format.</CardContent>
          </Card>
        </div>
        <div className="my-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-800 dark:text-white">Why Prabisha Invoice?</h2>
          <ul className="inline-block text-left space-y-3 text-lg">
            <li className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /> Fast, easy invoice and quote creation</li>
            <li className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /> Modern, beautiful PDF templates</li>
            <li className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /> Multi-currency support (INR, USD, GBP)</li>
            <li className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /> Download and email invoices instantly</li>
            <li className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /> Analytics and exportable reports</li>
            <li className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /> No subscription required</li>
          </ul>
        </div>
      </main>
      <footer className="py-8 text-center text-gray-500 text-base border-t mt-8 bg-white/70 dark:bg-gray-900/70">
        &copy; {new Date().getFullYear()} Prabisha Invoice. All rights reserved.
      </footer>
    </div>
  )
} 
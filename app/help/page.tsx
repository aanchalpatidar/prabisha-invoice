"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, HelpCircle, BookOpen } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" /> Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Getting Started</h2>
            <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
              <li>Set up your company details from the dashboard or company page.</li>
              <li>Add customers and services for quick invoice/quotation creation.</li>
              <li>Use the currency switcher to invoice in INR, USD, or GBP.</li>
              <li>Preview and download professional PDFs for invoices and quotations.</li>
              <li>Access analytics and export reports from the Reports page.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-2 flex items-center gap-2"><Mail className="h-5 w-5" /> Contact Support</h2>
            <p className="text-sm text-gray-700">For help, email <a href="mailto:support@prabisha.com" className="text-blue-600 underline">support@prabisha.com</a> or call +91-12345-67890.</p>
          </div>
          <div>
            <h2 className="font-semibold mb-2 flex items-center gap-2"><HelpCircle className="h-5 w-5" /> FAQs</h2>
            <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
              <li><b>How do I add my company logo?</b> Go to the Company page and upload your logo in the form.</li>
              <li><b>How do I export my data?</b> Use the export buttons on the Reports page to download CSV or Excel files.</li>
              <li><b>Can I change the invoice currency?</b> Yes, use the currency switcher in the header or on the invoice page.</li>
              <li><b>How do I get support?</b> Email or call us using the contact info above.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
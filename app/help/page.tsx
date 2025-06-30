"use client"

import { useSystemSettings } from "@/contexts/system-settings-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  FileText, 
  Receipt, 
  Users, 
  BarChart3, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  BookOpen, 
  Settings, 
  Download, 
  Send, 
  Eye,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  Printer,
  Share2,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from "lucide-react"

export default function HelpPage() {
  const { settings } = useSystemSettings()

  const helpSections = [
    {
      title: "Getting Started",
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        {
          question: "How do I create my first invoice?",
          answer: "Navigate to Invoices → Create Invoice. Fill in the customer details, add line items, and click 'Generate Invoice' to create your first professional invoice."
        },
        {
          question: "How do I set up my company details?",
          answer: "Go to Company page to configure your business information, logo, and branding. This information will appear on all your invoices and quotations."
        },
        {
          question: "How do I add customers?",
          answer: "Visit Customers page and click 'Add Customer'. Fill in the customer's contact information and save. You can then select them when creating invoices."
        }
      ]
    },
    {
      title: "Invoices",
      icon: <Receipt className="h-5 w-5" />,
      items: [
        {
          question: "How do I create an invoice?",
          answer: "Click 'Create Invoice', select a customer, add line items with descriptions and prices, set payment terms, and generate the invoice. You can preview before sending."
        },
        {
          question: "Can I customize invoice templates?",
          answer: "Yes! The system offers multiple professional templates. You can also customize colors and branding through System Settings."
        },
        {
          question: "How do I send invoices to customers?",
          answer: "After creating an invoice, click 'Send Invoice' to email it directly to your customer. You can also download PDF versions."
        },
        {
          question: "How do I track invoice status?",
          answer: "View all invoices in the Invoices page. Status is automatically updated: Draft, Sent, Paid, or Overdue."
        }
      ]
    },
    {
      title: "Quotations",
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          question: "What's the difference between invoices and quotations?",
          answer: "Quotations are estimates sent to potential customers, while invoices are bills for completed work. Quotations can be converted to invoices."
        },
        {
          question: "How do I create a quotation?",
          answer: "Go to Quotations → Create Quotation. The process is similar to invoices but includes validity period and terms."
        },
        {
          question: "Can I convert a quotation to an invoice?",
          answer: "Yes! When a quotation is accepted, you can convert it to an invoice with one click."
        }
      ]
    },
    {
      title: "Customer Management",
      icon: <Users className="h-5 w-5" />,
      items: [
        {
          question: "How do I manage customer information?",
          answer: "Access the Customers page to view, edit, and manage all customer details. You can also track their invoice history."
        },
        {
          question: "Can I import customers from other systems?",
          answer: "Currently, customers need to be added manually. Bulk import features are planned for future updates."
        }
      ]
    },
    {
      title: "Reports & Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      items: [
        {
          question: "What reports are available?",
          answer: "View sales summaries, outstanding payments, customer analytics, and revenue reports. All data is automatically calculated."
        },
        {
          question: "Can I export report data?",
          answer: "Yes! Reports can be exported as PDF or Excel files for further analysis or sharing."
        }
      ]
    },
    {
      title: "System Settings",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          question: "How do I customize the system appearance?",
          answer: "Admin users can access System Settings to change colors, logo, site title, and other branding elements."
        },
        {
          question: "Can I manage user roles and permissions?",
          answer: "Yes! Admin users can create custom roles with specific permissions for different team members."
        }
      ]
    }
  ]

  const quickActions = [
    {
      title: "Create Invoice",
      description: "Generate a new invoice",
      icon: <Plus className="h-4 w-4" />,
      href: "/invoices/create"
    },
    {
      title: "Add Customer",
      description: "Add a new customer",
      icon: <Users className="h-4 w-4" />,
      href: "/customers"
    },
    {
      title: "View Reports",
      description: "Check your analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/reports"
    },
    {
      title: "Company Setup",
      description: "Configure your business",
      icon: <Building2 className="h-4 w-4" />,
      href: "/company"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Find answers to common questions and learn how to use the invoice management system effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to get you started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <a
                    key={action.title}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent hover:border-primary transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Sections */}
          <div className="space-y-6">
            {helpSections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a 
                        href={`mailto:${settings.contactEmail}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {settings.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a 
                        href={`tel:${settings.contactPhone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                
                {settings.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Use templates to save time on recurring invoices</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Set up automatic payment reminders</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Regularly backup your customer data</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Use the search and filter features to find invoices quickly</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
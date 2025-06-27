"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerForm } from "@/components/customer-form"
import { Plus, Users, Search } from "lucide-react"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  billingAddress: string
  shippingAddress?: string
}

interface CustomerSelectorProps {
  selectedCustomer?: Customer | null
  onCustomerSelect: (customer: Customer) => void
  onNext: () => void
}

export function CustomerSelector({ selectedCustomer, onCustomerSelect, onNext }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState(selectedCustomer?.id || "")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      toast.error("Failed to fetch customers")
    } finally {
      setLoading(false)
    }
  }

  const handleNewCustomer = async (customerData: any) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) throw new Error("Failed to create customer")

      const newCustomer = await response.json()
      setCustomers((prev) => [newCustomer, ...prev])
      onCustomerSelect(newCustomer)
      setShowNewCustomerForm(false)
      toast.success("Customer created successfully")
    } catch (error) {
      throw error
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setSelectedCustomerId(customerId)
      onCustomerSelect(customer)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showNewCustomerForm) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowNewCustomerForm(false)}>
          ← Back to Customer Selection
        </Button>
        <CustomerForm onSubmit={handleNewCustomer} onCancel={() => setShowNewCustomerForm(false)} />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="customer-search">Search Customers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="customer-search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => setShowNewCustomerForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-select">Select Customer</Label>
              <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-sm text-gray-500">{customer.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Selected Customer:</h4>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-gray-600">{selectedCustomer.phone}</p>}
                  <p className="text-gray-600">{selectedCustomer.billingAddress}</p>
                </div>
              </div>
            )}

            <Button onClick={onNext} disabled={!selectedCustomer} className="w-full">
              Continue to Line Items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

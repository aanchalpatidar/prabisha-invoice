"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CustomerForm } from "@/components/customer-form"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Plus, Search, Edit, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  billingAddress: string
  shippingAddress?: string
  createdAt: string
  _count: {
    invoices: number
    quotations: number
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; customerId: string | null }>({
    open: false,
    customerId: null,
  })

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

  const handleSubmit = async (data: any) => {
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers"
      const method = editingCustomer ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save customer")

      await fetchCustomers()
      setShowForm(false)
      setEditingCustomer(null)
      toast.success(`Customer ${editingCustomer ? "updated" : "created"} successfully`)
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete customer")

      setCustomers((prev) => prev.filter((customer) => customer.id !== customerId))
      toast.success("Customer deleted successfully")
    } catch (error) {
      toast.error("Failed to delete customer")
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCustomer(null)
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer database</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <CustomerForm initialData={editingCustomer || undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Billing Address</TableHead>
              <TableHead className="text-center">Invoices</TableHead>
              <TableHead className="text-center">Quotations</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell className="whitespace-pre-line">{customer.billingAddress}</TableCell>
                  <TableCell className="text-center">{customer._count.invoices}</TableCell>
                  <TableCell className="text-center">{customer._count.quotations}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, customerId: customer.id })}
                      disabled={customer._count.invoices > 0 || customer._count.quotations > 0}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, customerId: null })}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        onConfirm={() => {
          if (deleteDialog.customerId) {
            handleDelete(deleteDialog.customerId)
            setDeleteDialog({ open: false, customerId: null })
          }
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}

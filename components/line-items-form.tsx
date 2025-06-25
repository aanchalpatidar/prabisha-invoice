"use client"

import React from "react"

import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/loading-button"
import { Plus, Trash2, Package } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { ServiceSelector } from "@/components/service-selector"

const lineItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
})

const lineItemsSchema = z.object({
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
})

type LineItemsFormData = z.infer<typeof lineItemsSchema>
export type LineItem = z.infer<typeof lineItemSchema>

interface LineItemsFormProps {
  initialData?: LineItem[]
  onSubmit: (data: LineItem[]) => void
  onTotalsChange?: (subtotal: number, taxAmount: number, total: number) => void
}

export function LineItemsForm({ initialData, onSubmit, onTotalsChange }: LineItemsFormProps) {
  const { formatCurrency } = useCurrency()
  const [loading, setLoading] = useState(false)

  const form = useForm<LineItemsFormData>({
    resolver: zodResolver(lineItemsSchema),
    defaultValues: {
      items: initialData?.length ? initialData : [{ name: "", description: "", quantity: 1, price: 0, taxRate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")

  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((sum, item) => {
      return sum + item.quantity * item.price
    }, 0)

    const taxAmount = watchedItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price
      return sum + itemTotal * (item.taxRate / 100)
    }, 0)

    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  // Call onTotalsChange when totals change
  React.useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange(subtotal, taxAmount, total)
    }
  }, [subtotal, taxAmount, total, onTotalsChange])

  const handleSubmit = async (data: LineItemsFormData) => {
    try {
      setLoading(true)
      onSubmit(data.items)
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    append({ name: "", description: "", quantity: 1, price: 0, taxRate: 0 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Line Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter item description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.taxRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-medium">
                          {formatCurrency(watchedItems[index]?.quantity * watchedItems[index]?.price || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            <ServiceSelector
              onServiceSelect={(service) => {
                append({
                  name: service.name,
                  description: service.description || "",
                  quantity: 1,
                  price: service.price,
                  taxRate: service.taxRate,
                })
              }}
            />

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <LoadingButton type="submit" loading={loading} className="w-full">
              Continue
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

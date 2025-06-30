"use client"

import React from "react"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/loading-button"
import { Plus, Trash2, Package, Edit2, Check, X } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { ServiceSelector } from "@/components/service-selector"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
  const [editingRow, setEditingRow] = useState<number | null>(null)

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

  const startEditing = (index: number) => {
    setEditingRow(index)
  }

  const stopEditing = () => {
    setEditingRow(null)
  }

  const calculateItemTotal = (item: LineItem) => {
    return item.quantity * item.price
  }

  const calculateItemTax = (item: LineItem) => {
    return calculateItemTotal(item) * (item.taxRate / 100)
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
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Item Name</TableHead>
                    <TableHead className="w-[15%]">Description</TableHead>
                    <TableHead className="w-[10%] text-right">Qty</TableHead>
                    <TableHead className="w-[15%] text-right">Unit Price</TableHead>
                    <TableHead className="w-[10%] text-right">Tax %</TableHead>
                    <TableHead className="w-[15%] text-right">Total</TableHead>
                    <TableHead className="w-[5%] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="hover:bg-muted/50">
                      <TableCell>
                        {editingRow === index ? (
                          <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input 
                                    placeholder="Item name" 
                                    {...field} 
                                    className="h-8"
                                    autoFocus
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="font-medium">
                            {watchedItems[index]?.name || "Untitled Item"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input 
                                    placeholder="Description" 
                                    {...field} 
                                    className="h-8"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground truncate max-w-[120px]">
                            {watchedItems[index]?.description || "-"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingRow === index ? (
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="1"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                    className="h-8 w-20 text-right"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="text-right font-medium">
                            {watchedItems[index]?.quantity || 0}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingRow === index ? (
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                    className="h-8 w-24 text-right"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="text-right font-medium">
                            {formatCurrency(watchedItems[index]?.price || 0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingRow === index ? (
                          <FormField
                            control={form.control}
                            name={`items.${index}.taxRate`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                    className="h-8 w-16 text-right"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="text-right">
                            <Badge variant={watchedItems[index]?.taxRate > 0 ? "default" : "secondary"} className="text-xs">
                              {watchedItems[index]?.taxRate || 0}%
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold">
                          {formatCurrency(calculateItemTotal(watchedItems[index] || { quantity: 0, price: 0 }))}
                        </div>
                        {watchedItems[index]?.taxRate > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Tax: {formatCurrency(calculateItemTax(watchedItems[index] || { quantity: 0, price: 0, taxRate: 0 }))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {editingRow === index ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={stopEditing}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(index)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(index)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={addItem} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <ServiceSelector
                onServiceSelect={(service) => {
                  append({
                    name: service.name,
                    description: service.description || "",
                    quantity: 1,
                    price: Number(service.price),
                    taxRate: Number(service.taxRate),
                  })
                }}
              />
            </div>

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

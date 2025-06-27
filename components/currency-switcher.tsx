"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency, type Currency } from "@/contexts/currency-context"

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()

  return (
    <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">USD</SelectItem>
        <SelectItem value="GBP">GBP</SelectItem>
        <SelectItem value="INR">INR</SelectItem>
      </SelectContent>
    </Select>
  )
}

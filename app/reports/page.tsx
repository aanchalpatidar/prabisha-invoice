"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { saveAs } from "file-saver"

// Placeholder for chart (replace with real chart lib if needed)
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  return (
    <div className="w-full h-48 flex items-end gap-2">
      {data.map((val, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className="bg-orange-500 rounded-t"
            style={{ height: `${val}px`, width: "24px" }}
            title={labels[i] + ": " + val}
          ></div>
          <span className="text-xs mt-1">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function exportToCSV(stats: any) {
  const rows = [
    ["Metric", "Value"],
    ["Total Revenue", stats.totalRevenue],
    ["Total Invoices", stats.totalInvoices],
    ...stats.topCustomers.map((c: any) => ["Top Customer: " + c.name, c.total]),
    ...stats.monthly.map((val: number, i: number) => ["Month " + (i + 1), val]),
  ]
  const csv = rows.map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, `report-${new Date().toISOString().slice(0, 10)}.csv`)
}

function exportToExcel(stats: any) {
  // Simple Excel XML (for demo, for real use xlsx lib)
  let xml = `<?xml version="1.0"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Report"><Table>\n`;
  xml += `<Row><Cell><Data ss:Type="String">Metric</Data></Cell><Cell><Data ss:Type="String">Value</Data></Cell></Row>\n`;
  xml += `<Row><Cell><Data ss:Type="String">Total Revenue</Data></Cell><Cell><Data ss:Type="Number">${stats.totalRevenue}</Data></Cell></Row>\n`;
  xml += `<Row><Cell><Data ss:Type="String">Total Invoices</Data></Cell><Cell><Data ss:Type="Number">${stats.totalInvoices}</Data></Cell></Row>\n`;
  stats.topCustomers.forEach((c: any) => {
    xml += `<Row><Cell><Data ss:Type="String">Top Customer: ${c.name}</Data></Cell><Cell><Data ss:Type="Number">${c.total}</Data></Cell></Row>\n`;
  })
  stats.monthly.forEach((val: number, i: number) => {
    xml += `<Row><Cell><Data ss:Type="String">Month ${i + 1}</Data></Cell><Cell><Data ss:Type="Number">${val}</Data></Cell></Row>\n`;
  })
  xml += `</Table></Worksheet></Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" })
  saveAs(blob, `report-${new Date().toISOString().slice(0, 10)}.xls`)
}

export default function ReportsPage() {
  const { currency, setCurrency, formatCurrency } = useCurrency()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalInvoices: 0,
    topCustomers: [],
    monthly: [],
  })

  useEffect(() => {
    fetchStats()
  }, [currency, dateFrom, dateTo])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)
      if (currency) params.append("currency", currency)
      const res = await fetch(`/api/reports/summary?${params.toString()}`)
      const data = await res.json()
      setStats(data)
    } catch (e) {
      setStats({ totalRevenue: 0, totalInvoices: 0, topCustomers: [], monthly: [] })
    }
    setLoading(false)
  }

  const handleExport = (type: "csv" | "excel") => {
    if (type === "csv") exportToCSV(stats)
    else exportToExcel(stats)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-orange-600" /> Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">Business insights, trends, and exportable reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}> <Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          <Button variant="outline" onClick={() => handleExport("excel")}> <Download className="h-4 w-4 mr-2" /> Export Excel</Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="flex flex-wrap gap-6 pt-6">
          <div>
            <label className="block text-xs mb-1">From</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1">To</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1">Currency</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-700 pt-4">
            {loading ? "..." : formatCurrency(stats.totalRevenue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-700 pt-4">
            {loading ? "..." : stats.totalInvoices}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? "..." : (
              <ul className="space-y-1">
                {stats.topCustomers.map((c: any) => (
                  <li key={c.name} className="flex justify-between">
                    <span>{c.name}</span>
                    <span className="font-semibold">{formatCurrency(c.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="h-48 bg-gray-100 animate-pulse rounded" /> : <BarChart data={stats.monthly} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]} />}
        </CardContent>
      </Card>
    </div>
  )
} 
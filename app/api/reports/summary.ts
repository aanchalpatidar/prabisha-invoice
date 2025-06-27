import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const staticRates = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0095,
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get("currency") || "INR"
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const rate = staticRates[currency as keyof typeof staticRates] || 1

    // Build date filter
    const dateFilter: any = {}
    if (dateFrom) dateFilter.gte = new Date(dateFrom)
    if (dateTo) dateFilter.lte = new Date(dateTo)

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(dateFrom || dateTo ? { issueDate: dateFilter } : {}),
        status: { not: "CANCELLED" },
      },
      include: { customer: true },
    })

    // Calculate stats
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0) * rate
    const totalInvoices = invoices.length
    const customerTotals: Record<string, { name: string; total: number }> = {}
    invoices.forEach(inv => {
      if (!customerTotals[inv.customerId]) {
        customerTotals[inv.customerId] = { name: inv.customer.name, total: 0 }
      }
      customerTotals[inv.customerId].total += Number(inv.total)
    })
    const topCustomers = Object.values(customerTotals)
      .map(c => ({ ...c, total: c.total * rate }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Monthly revenue (last 6 months)
    const now = new Date()
    const monthly: number[] = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = month.toISOString().slice(0, 7)
      const monthTotal = invoices
        .filter(inv => inv.issueDate.toISOString().slice(0, 7) === monthStr)
        .reduce((sum, inv) => sum + Number(inv.total), 0) * rate
      monthly.push(monthTotal)
    }

    return NextResponse.json({
      totalRevenue,
      totalInvoices,
      topCustomers,
      monthly,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
} 
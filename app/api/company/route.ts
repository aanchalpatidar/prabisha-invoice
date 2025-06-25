import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const company = await prisma.company.findFirst()
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const company = await prisma.company.create({
      data,
    })

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    const existingCompany = await prisma.company.findFirst()

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data,
    })

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}

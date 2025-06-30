import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendUserLoginCredentials } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!currentUser?.role?.name || currentUser.role.name !== 'ADMIN') {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const data = await request.json()
    const { name, email, password, roleId, sendCredentials = false } = data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in the same organization
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizationId: currentUser.organizationId!,
        roleId
      },
      include: {
        role: true
      }
    })

    // Send credentials email if requested
    if (sendCredentials) {
      try {
        const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`
        await sendUserLoginCredentials(user, password, loginUrl)
      } catch (emailError) {
        console.error("Failed to send credentials email:", emailError)
        // Don't fail the user creation if email fails
      }
    }

    return NextResponse.json({
      ...user,
      credentialsSent: sendCredentials
    })
  } catch (error: any) {
    console.error("POST user error:", error)
    return NextResponse.json({ error: `Failed to create user: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!currentUser?.role?.name || currentUser.role.name !== 'ADMIN') {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { organizationId: currentUser.organizationId },
      include: {
        role: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("GET users error:", error)
    return NextResponse.json({ error: `Failed to fetch users: ${error.message}` }, { status: 500 })
  }
} 
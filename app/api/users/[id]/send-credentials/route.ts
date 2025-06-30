import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendUserLoginCredentials } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the user to send credentials to
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate a new temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: params.id },
      data: { 
        password: hashedPassword
        // Note: We could add a custom field to track password reset requirement
        // but for now, we'll just update the password
      }
    })

    // Send email with credentials
    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`
    
    await sendUserLoginCredentials(user, tempPassword, loginUrl)

    return NextResponse.json({ 
      message: "Login credentials sent successfully",
      email: user.email 
    })
  } catch (error: any) {
    console.error("Error sending credentials:", error)
    return NextResponse.json(
      { error: `Failed to send credentials: ${error.message}` },
      { status: 500 }
    )
  }
} 
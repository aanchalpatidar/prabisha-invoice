import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET(
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

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { role: true, organization: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("GET user error:", error)
    return NextResponse.json({ error: `Failed to fetch user: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(
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

    const data = await request.json()
    const { name, email, phone, roleId, isActive, password } = data

    // Get the user being updated
    const userToUpdate = await prisma.user.findUnique({
      where: { id: params.id },
      include: { role: true }
    })

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      roleId,
      isActive
    }

    // Hash password if provided
    if (password) {
      updateData.password = await hash(password, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: { role: true, organization: true }
    })

    // Check if role was changed
    const roleChanged = userToUpdate.roleId !== roleId

    return NextResponse.json({
      user: updatedUser,
      roleChanged,
      message: roleChanged 
        ? "User updated successfully. User will be logged out on next request due to role change." 
        : "User updated successfully"
    })
  } catch (error: any) {
    console.error("PUT user error:", error)
    return NextResponse.json({ error: `Failed to update user: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("DELETE user error:", error)
    return NextResponse.json({ error: `Failed to delete user: ${error.message}` }, { status: 500 })
  }
} 
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large. Maximum 5MB allowed." }, { status: 400 })
    }

    try {
      // Try ImageKit first
      const imagekitResult = await uploadToImageKit(file)
      return NextResponse.json({
        url: imagekitResult.url,
        fileId: imagekitResult.fileId,
        provider: "imagekit",
      })
    } catch (imagekitError) {
      console.warn("ImageKit upload failed, trying Cloudinary:", imagekitError)

      try {
        // Fallback to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file)
        return NextResponse.json({
          url: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId,
          provider: "cloudinary",
        })
      } catch (cloudinaryError) {
        console.error("Both ImageKit and Cloudinary failed:", cloudinaryError)
        return NextResponse.json({ error: "Failed to upload image. Please try again." }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

async function uploadToImageKit(file: File) {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileName", `logo-${Date.now()}-${file.name}`)
    formData.append("folder", "/company-logos")

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`ImageKit upload failed: ${errorData}`)
    }

    const result = await response.json()
    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
    }
  } catch (error) {
    console.error("ImageKit upload error:", error)
    throw error
  }
}

async function uploadToCloudinary(file: File) {
  try {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataURI = `data:${file.type};base64,${base64}`

    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = generateCloudinarySignature(timestamp)

    const formData = new FormData()
    formData.append("file", dataURI)
    formData.append("timestamp", timestamp.toString())
    formData.append("api_key", process.env.CLOUDINARY_API_KEY!)
    formData.append("signature", signature)
    formData.append("folder", "company-logos")

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Cloudinary upload failed: ${errorData}`)
    }

    const result = await response.json()
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

function generateCloudinarySignature(timestamp: number) {
  const crypto = require("crypto")
  const paramsToSign = `folder=company-logos&timestamp=${timestamp}`
  return crypto
    .createHash("sha1")
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex")
}

import ImageKit from "imagekit"

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

export async function uploadToImageKit(file: File, fileName: string) {
  try {
    const buffer = await file.arrayBuffer()

    const result = await imagekit.upload({
      file: Buffer.from(buffer),
      fileName: fileName,
      folder: "/company-logos",
    })

    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
    }
  } catch (error) {
    console.error("ImageKit upload error:", error)
    throw new Error("Failed to upload to ImageKit")
  }
}

export async function deleteFromImageKit(fileId: string) {
  try {
    await imagekit.deleteFile(fileId)
    return { success: true }
  } catch (error) {
    console.error("ImageKit delete error:", error)
    throw new Error("Failed to delete from ImageKit")
  }
}

// src/services/cloudinary.js

const CLOUD_NAME = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME; // <- Thay bằng cloud name của bạn
const UPLOAD_PRESET = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET; // <- Thay bằng upload preset đã tạo

export async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    console.log("Upload: ", data);

    if (response.ok) {
      return data.secure_url
    } else {
      throw new Error(data.error?.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

// Helper function to validate and clean image URLs
export function validateImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  
  // Verificar que sea una URL válida
  if (trimmed === '' || 
      (!trimmed.startsWith('http://') && 
       !trimmed.startsWith('https://') && 
       !trimmed.startsWith('data:') && 
       !trimmed.startsWith('/'))) {
    return null;
  }

  return trimmed;
}

// Helper function to get the first valid image from an array
export function getFirstValidImage(images: string[] | null | undefined): string | null {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  for (const img of images) {
    const validUrl = validateImageUrl(img);
    if (validUrl) {
      return validUrl;
    }
  }

  return null;
}

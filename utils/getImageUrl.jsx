export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ;
  
  if (typeof window !== 'undefined') {
    console.log('API URL:', apiUrl);
    console.log('Image Path:', imagePath);
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    if (imagePath.includes('localhost')) {
      const uploadsIndex = imagePath.indexOf('/uploads');
      if (uploadsIndex !== -1) {
        const path = imagePath.substring(uploadsIndex);
        return `${apiUrl}${path}`;
      }
    }
    return imagePath;
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${apiUrl}${cleanPath}`;
};
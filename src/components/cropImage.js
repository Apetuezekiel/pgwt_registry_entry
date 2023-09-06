export const getCroppedImg = async (imageSrc, crop, zoom) => {
    const image = new Image();
    image.src = imageSrc;
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    const maxSize = Math.max(image.width, image.height);
    const scale = maxSize / 512; // Limit output size to 512x512
    canvas.width = crop.width * scale;
    canvas.height = crop.height * scale;
  
    const xOffset = crop.x * scale;
    const yOffset = crop.y * scale;
  
    ctx.drawImage(
      image,
      xOffset,
      yOffset,
      crop.width * scale,
      crop.height * scale,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };
  
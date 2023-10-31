import React, { useState } from 'react';

function ImageUpload({ onImage }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set the canvas size to match the image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);

          // Convert the canvas content to a PNG data URL
          const pngDataUrl = canvas.toDataURL('image/png');

          setSelectedImage(pngDataUrl);
          // Call the callback function to pass the selected PNG image data to the parent
          onImage(pngDataUrl);
        };
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
    </div>
  );
}

export default ImageUpload;
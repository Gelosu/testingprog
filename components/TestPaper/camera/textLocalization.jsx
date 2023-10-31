import React, { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';

function TextLocalized({ imageData }) {
  const [localizedImageData, setLocalizedImageData] = useState(null);
  const [localizedImageWithBoxes, setLocalizedImageWithBoxes] = useState(null);

  useEffect(() => {
    if (imageData) {
      localizeText(imageData);
    }
  }, [imageData]);

  const localizeText = async (imageData) => {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(imageData);

    // Load the original image as an HTMLImageElement
    const originalImage = new Image();
    originalImage.src = imageData;

    originalImage.onload = () => {
      // Create a new canvas to draw the image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match the image
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      // Draw the original image on the canvas
      context.drawImage(originalImage, 0, 0);

      // Draw green boxes around words
      context.strokeStyle = 'green';
      context.lineWidth = 1;
      data.words.forEach((word) => {
        context.strokeRect(
          word.bbox.x0,
          word.bbox.y0,
          word.bbox.x1 - word.bbox.x0,
          word.bbox.y1 - word.bbox.y0
        );
      });

      // Convert canvas to base64 image data
      const imageWithBoxes = canvas.toDataURL('image/jpeg');

      setLocalizedImageData(data.text);
      setLocalizedImageWithBoxes(imageWithBoxes);
    };

    await worker.terminate();
  };

  return (
    <div>
      {localizedImageData && (
        <div>
          <h2>Localized Image:</h2>
          <img
            src={localizedImageWithBoxes} // Display the image with green boxes
            alt="Localized"
            style={{ maxWidth: '100%' }}
          />
        </div>
      )}
    </div>
  );
}

export default TextLocalized;
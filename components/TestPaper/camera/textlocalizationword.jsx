import React, { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';

function TextLocalization2({ imageData }) {
  const [localizedImageData, setLocalizedImageData] = useState(null);
  const [localizedImageWithBoxes, setLocalizedImageWithBoxes] = useState(null);
  const [localizedText, setLocalizedText] = useState(null);

  useEffect(() => {
    if (imageData) {
      localizeText(imageData);
    }
  }, [imageData]);

  const localizeText = async (imageData) => {
    const worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,. ) ',

    });
    const { data } = await worker.recognize(imageData);

    // Load the original image as an HTMLImageElement
    const originalImage = new Image();
    originalImage.src = imageData;

    originalImage.onload = () => {
      // Create a new canvas to draw the image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match the image with extra width
      canvas.width = originalImage.width + 330; // Add extra width for displaying text
      canvas.height = originalImage.height;

      // Fill the extra width with a white background
      context.fillStyle = 'white';
      context.fillRect(originalImage.width, 0, 330, originalImage.height);

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

        // Display the recognized text to the right of the bordered word
        context.fillStyle = 'green';
        context.font = '20px Arial';
        context.fillText(word.text, word.bbox.x1 + 10, word.bbox.y1);
      });

      // Convert canvas to base64 image data
      const imageWithBoxes = canvas.toDataURL('image/jpeg');

      setLocalizedImageData(data.text);
      setLocalizedImageWithBoxes(imageWithBoxes);
      setLocalizedText(data.words.map((word) => word.text).join(' '));
      console.log('Localized Text:', data.text);
      
    };
    
    await worker.terminate();
  };

  return (
    <div>
      {localizedImageData && (
        <div>
          <h2>Localized Image:</h2>
          <img
            src={localizedImageWithBoxes} // Display the image with green boxes and text
            alt="Localized"
            style={{ maxWidth: '100%' }}
          />
        </div>
      )}
      {localizedText && (
        <div>
          <h2>Localized Text:</h2>
          <p>{localizedText}</p>
        </div>
      )}
    </div>
  );
}

export default TextLocalization2;
import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

function TesseractOCR({ Image }) {
  const [recognizedText, setRecognizedText] = useState('');
  const [recognizedTextArray, setRecognizedTextArray] = useState([]);

  useEffect(() => {
    const recognizeText = async () => {
      if (Image) {
        const worker = await createWorker('eng');
        try {
          await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,. ) ',

          });
          const { data: { text } } = await worker.recognize(Image);

          let array = text.split('\n');
          console.log(array);

          let length = array.length;
          console.log(`length: ${length}`);

          setRecognizedText(text);
          setRecognizedTextArray(array.filter(line => line.trim() !== ""));
          await worker.terminate();
        } catch (error) {
          console.error(error);
        }
      }
    };

    recognizeText();
  }, [Image]);

  const listStyle = {
    listStyleType: 'none', // Remove bullets
  };

  return (
    <div>
      {recognizedText && (
        <div>
          <h2>Recognized Text:</h2>
          <ol style={listStyle}>
            {recognizedTextArray.map((line, index) => (
               <li key={index}>{line}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default TesseractOCR;
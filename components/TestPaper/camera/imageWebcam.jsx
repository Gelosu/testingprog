import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function WebcamCapture() {
  const webcamRef = useRef(null);

  // State to control the visibility of the webcam and retrieved image
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [retrievedImage, setRetrievedImage] = useState(null);

  const toggleWebcam = () => {
    if (webcamEnabled) {
      // If the webcam is enabled, close it by setting webcamEnabled to false.
      // This will hide the webcam component.
      setWebcamEnabled(false);
    } else {
      // If the webcam is disabled, enable it by setting webcamEnabled to true.
      setWebcamEnabled(true);
    }
  };

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setWebcamEnabled(true);

      try {
        const processedImageSrc = await processImage(imageSrc);
        await postImage(processedImageSrc);
      } catch (error) {
        console.error('Error processing and posting image:', error);
      }
    }
  };

  const postImage = async (processedImage) => {
    if (!processedImage) {
      return;
    }

    const formData = new FormData();
    formData.append('image', processedImage);

    try {
      // Adjust the URL to match your server endpoint for posting images
      await axios.post('http://localhost:3002/post-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      getImage();
    } catch (error) {
      console.error('Error posting image:', error);
    }
  };

  const getImage = async () => {
    try {
      // Adjust the URL to match your server endpoint for retrieving images
      const response = await axios.get('http://localhost:3002/get-image', {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);
      setRetrievedImage(imageUrl);
    } catch (error) {
      console.error('Error getting image:', error);
    }
  };

  const processImage = async (imageSrc) => {
    try {
      const img = new Image();
      img.src = imageSrc;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      context.drawImage(img, 0, 0, img.width, img.height);

      const processedImageSrc = canvas.toDataURL('image/jpeg');

      return processedImageSrc;
    } catch (error) {
      console.error('Error processing image:', error);
      return imageSrc;
    }
  };

  return (
    <div>
      {webcamEnabled ? (
        <div>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          <br />
          <button onClick={capture}>Capture and Process Image</button>
          <button onClick={toggleWebcam} className="disable-webcam-button">
            Disable Webcam
          </button>
        </div>
      ) : (
        <button onClick={toggleWebcam} className="enable-webcam-button">
          Enable Webcam
        </button>
      )}
      {retrievedImage && (
        <img
          src={retrievedImage}
          alt="Retrieved Image"
          style={{ maxWidth: '100%' }}
        />
      )}
    </div>
  );
}

export default WebcamCapture;

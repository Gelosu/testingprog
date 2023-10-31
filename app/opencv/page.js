"use client"

import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam'; // Import the Webcam component
import axios from 'axios';

const ImageInput = ({ onImageSelected }) => {
  const [retrievedImage, setRetrievedImage] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const webcamRef = React.createRef(); // Create a reference for the webcam component

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    uploadImage(selectedImage);
  };

  const captureWebcamImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const blob = dataURItoBlob(imageSrc);
      uploadImage(blob);
    }
  };

  const toggleCamera = () => {
    // Toggle the camera state (enable/disable)
    setCameraEnabled(!cameraEnabled);
  };

  const uploadImage = async (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);

    try {
      await axios.post('http://localhost:3002/post-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // After posting, trigger the getImage function
      getImage();
    } catch (error) {
      console.error('Error posting image:', error);
    }
  };

  const getImage = async () => {
    try {
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

  useEffect(() => {
    if (retrievedImage) {
      onImageSelected(retrievedImage);
    }
  }, [retrievedImage, onImageSelected]);

  return (
    <div>
      {cameraEnabled ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
        />
      ) : (
        <p>Camera is disabled</p>
      )}
      <button onClick={toggleCamera}>
        {cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
      </button>
      {cameraEnabled && (
        <button onClick={captureWebcamImage}>Capture Webcam Image</button>
      )}
      <input type="file" accept="image/*" onChange={handleImageChange} />
    </div>
  );
};

export default ImageInput;

// Utility function to convert data URI to Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function EventRegsistration2() {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ aspect: 4 / 3 });
  const [croppedImage, setCroppedImage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1,
  });

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const handleZoomChange = (newZoom) => {
    setCrop({ ...crop, zoom: newZoom });
  };

  const handleCropImage = async () => {
    if (image) {
      const croppedImageUrl = await getCroppedImg(image, crop);
      setCroppedImage(croppedImageUrl);
    }
  };

  const getCroppedImg = (src, crop) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        }, 'image/jpeg');
      };
    });
  };

  return (
    <div className="App">
      <h1>Image Editor</h1>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag and drop an image here or click to select</p>
      </div>
      {image && (
  <div className="editor">
    <ReactCrop
      src={image}
      crop={crop}
      onImageLoaded={(image) => {
        handleCropChange({
          ...crop,
          width: image.width,
          height: image.height,
        });
      }}
      onChange={handleCropChange}
    />
  </div>
)}

      <div className="controls">
        <div className="slider-container">
          <p>Zoom</p>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={crop.zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          />
        </div>
        <button onClick={handleCropImage}>Crop Image</button>
      </div>
      {croppedImage && (
        <div className="output">
          <h2>Cropped Image</h2>
          <img src={croppedImage} alt="Cropped" />
        </div>
      )}
    </div>
  );
}

export default EventRegsistration2;

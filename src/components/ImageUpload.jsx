import React, { useState } from 'react';
import Draggable from 'react-draggable';

function ImageUpload() {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setImage(e.target.result);
      };

      reader.readAsDataURL(selectedImage);
    }
  };

  return (
    <div>
      <h1>Image Upload and Drag</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      {image && (
        <Draggable>
          <img
            src={image}
            alt="inviteePicture"
            style={{
              width: '200px',
              position: 'absolute',
            }}
          />
        </Draggable>
      )}
    </div>
  );
}

export default ImageUpload;

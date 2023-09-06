import React, { useState, useRef  } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import inviteImg from '../data/imgg/pgwt_flier.png'
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaUndo, FaRedo, FaPlus, FaMinus } from 'react-icons/fa';
import { BsZoomIn,  BsZoomOut} from 'react-icons/fa';
import { BsFillCloudDownloadFill, BsFillCameraFill} from 'react-icons/bs';

function EventRegistrationForm() {
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 180, height: 180, aspect: 1, x: 0, y: 0 }); // Initialize the crop object
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(100);
    const imageRef = useRef(null);
  
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
    
      const handleCropChange = (newCrop) => {
        setCrop(newCrop);
      };
    
      const handleRotationChange = (degrees) => {
        setRotation(degrees);
      };
  
      const handleMove = (direction) => {
        if (!imageRef.current) return;
        const { width, height } = imageRef.current.getBoundingClientRect();
        const step = 5;
      
        let newX = crop.x || 0;
        let newY = crop.y || 0;
      
        switch (direction) {
          case 'up':
            newY = Math.max(newY - step, 0);
            break;
          case 'down':
            newY = Math.min(newY + step, 100 - crop.height);
            break;
          case 'left':
            newX = Math.max(newX - step, 0);
            break;
          case 'right':
            newX = Math.min(newX + step, 100 - crop.width);
            break;
          default:
            break;
        }
      
        // Ensure newX and newY are valid percentages
        newX = Math.max(0, Math.min(newX, 100 - crop.width));
        newY = Math.max(0, Math.min(newY, 100 - crop.height));
      
        setCrop({ ...crop, x: newX, y: newY });
      };

      const handleZoomIn = () => {
        setZoom(Math.min(200, zoom + 10)); // Adjust the maximum zoom level as needed
      };
    
      const handleZoomOut = () => {
            setZoom(Math.max(10, zoom - 10)); // Adjust the minimum zoom level as needed
        };
      
      

  return (
    <div className="container" style={{width: "100vw"}}>
        <header
        style={{backgroundColor: "#2F4407", padding: "10px", color: "white" }}
        className='mb-5'
        >
      <h3 className="text-center" style={{textTransform: "uppercase"}}>Praise God with the Twins</h3>
      <h5 className='text-center'>Invitee Selfie Generator</h5>
        </header>
      <form id="registrationForm">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" className="form-control" id="name" name="name" required />
        </div>

            <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" className="form-control" id="email" name="email" required />
            </div>

        <div className="form-group imageUploadCtrl">
          <label htmlFor="picture" style={{marginRight: "10px"}}>Upload Picture:</label>
          <BsFillCameraFill color='#528609' size="30"/>
          <input
            type="file"
            className="form-control-file custom-file-upload"
            id="picture"
            name="picture"
            accept="image/*"
            required
            onChange={handleImageChange}
          />
        </div>


<div className="form-group mt-4" style={{
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center"
}}>
              <ReactCrop
            src={image}
            crop={crop}
            onChange={handleCropChange}
          />
        <button style={{backgroundColor: "#528609"}} type='button' className="btn btn-secondary" onClick={() => handleRotationChange(rotation - 90)}>
              <FaUndo/>
            </button>
            <button style={{backgroundColor: "#528609"}} type='button' className="btn btn-secondary ml-2" onClick={() => handleRotationChange(rotation + 90)}>
              <FaRedo/>
            </button>
            <button style={{backgroundColor: "#528609"}} type="button" className="btn actionBtn btn-secondary ml-2" onClick={handleZoomIn}><FaPlus /></button>
          <button style={{backgroundColor: "#528609"}} type="button" className="btn actionBtn btn-secondary ml-2" onClick={handleZoomOut}><FaMinus /></button>
        <button style={{backgroundColor: "#528609"}} type="button" className="btn actionBtn btn-secondary" onClick={() => handleMove('up')}><FaArrowUp /></button>
        <button style={{backgroundColor: "#528609"}} type="button" className="btn actionBtn btn-secondary ml-2" onClick={() => handleMove('down')}><FaArrowDown /></button>
        <button style={{backgroundColor: "#528609"}} type="button" className="btn actionBtn btn-secondary ml-2" onClick={() => handleMove('left')}><FaArrowLeft /></button>
        <button style={{backgroundColor: "#528609"}} type="button" className="btn btn-secondary actionBtn ml-2" onClick={() => handleMove('right')}><FaArrowRight /></button>
      </div>
        <div className="form-group pt-3" style={{position: 'relative'}}>
        {image && (
        <div className="">
          <img
            ref={imageRef}
            src={image}
            alt="Uploaded Image"
            className="img-fluid inviteeAvatar"
            style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                borderRadius: "50%",
                position: 'absolute',
                transform: `rotate(${rotation}deg)`,
                ...crop,
            }}
          />
        </div>
      )}
          <img
            src={inviteImg}
            alt="Invite Graphic"
            className="img-fluid"
          />
        </div>
        <div className='downloadCTN'>
        <button type="submit" className="btn btn-block btn-primary mt-3" style={{backgroundColor: "#528609", border: "solid 1px #528609", width: "90vw"}}>
          Download Invite <BsFillCloudDownloadFill className='downloadIcon'/>
        </button>
        </div>
      </form>
    </div>
  );
}

export default EventRegistrationForm;
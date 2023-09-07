import React, { useState, useRef, useEffect  } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
// import inviteImg from '../data/imgg/flier_twins.PNG'
import inviteImg from '../data/imgg/flier_twins2.png'
// import inviteImg from '../data/imgg/flier2.png'
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaUndo, FaRedo, FaPlus, FaMinus, FaFacebookSquare, FaTwitter } from 'react-icons/fa';
import { BsZoomIn,  BsZoomOut} from 'react-icons/fa';
import { BsFillCloudDownloadFill, BsFillCameraFill, BsPersonFillCheck} from 'react-icons/bs';
import { Prev } from 'react-bootstrap/esm/PageItem';
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable';
import emailjs from '@emailjs/browser';
// import emailjs from 'emailjs-com';
import showToast from '../utils/ToastUtils'
import { Link, useNavigate } from "react-router-dom";
import Spinner from './Spinner';



function EventRegistrationForm() {
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', height:180, width:180, aspect: 1, x: 0, y: 0 }); // Initialize the crop object
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const imageRef = useRef(null);
    const [xAxis, setXAxis] = useState(107);
    const [yAxis, setYAxis] = useState(6);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [nameValue, setNameValue] = useState('');
    const [formData, setFormData] = useState({
        to_firstname: '',
        to_lastname: '',
        to_phone: '',
        to_email: '',
        to_address: '',
      });
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isImageLoaded, setImageLoaded] = useState(false);
    const [showPreloader, setShowPreloaded] = useState(false);

    const divRef = useRef(null);
    const form = useRef();
    const navigate = useNavigate();

  
    const handleDownloadClick = (e) => {
      setShowPreloaded(true)
        e.preventDefault();
        if (
            !formData.to_firstname ||
            !formData.to_lastname ||
            !formData.to_phone ||
            !formData.to_email ||
            !formData.to_address
          ) {
            alert('Please fill in all required fields before submitting.');
            // showToast('success', result.text, 2000);
            return;
          }

        emailjs.sendForm('service_95ini6l', 'template_22ahgxo', form.current, '720F71y3XxllnZk_a')
        .then((result) => {
            console.log(result.text);
            showToast('success', "An email has been sent to your registered email address", 2000);
        }, (error) => {
            console.log(error.text);
            showToast('error', "The welcome mail wasnt sent to your registered email. Apologies. We are working on this", 2000);

        })

        emailjs.sendForm('service_95ini6l', 'template_63hjs1h', form.current, '720F71y3XxllnZk_a')
        .then((result) => {
            console.log(result.text);
        }, (error) => {
            console.log(error.text);
        })

        const divElement = divRef.current;
        if (imageRef.current) {
          imageRef.current.addEventListener('load', () => {
            setImageLoaded(true);
          });
        }
        const dpi = 300;
      
        const scaleFactor = dpi / 96;

        // if (isImageLoaded && divRef.current){
          html2canvas(divElement, {
            scale: scaleFactor,
          }).then((canvas) => {
            const dataURL = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'pgwt_invite.png';
            a.click();
  
            setTimeout(()=> {
      setShowPreloaded(false)
              navigate('/thanks')
            }, 2500)
          });
        // }
      
    };
      
    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value,
    });
    };
  
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
          const reader = new FileReader();
    
          reader.onload = (e) => {
            setImage(e.target.result);
            // const dataUrl = event.target.result;
            // setImageDataUrl(dataUrl);
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            setImageDataUrl(dataUrl);
          };
          reader.readAsDataURL(file);
        }
    };
  
    const handleMove = (direction) => {
        const step = 3;
      
        // let newX = crop.x || 0;
        // let newY = crop.y || 0;
      
        switch (direction) {
          case 'up':
            // newY = Math.max(newY - step, 0);
            setYAxis(Prev => Prev - step)
            break;
          case 'down':
            // newY = Math.min(newY + step, 100 - crop.height);
            setYAxis(Prev => Prev + step)
            break;
          case 'left':
            setXAxis(Prev => Prev - step)
            break;
          case 'right':
            setXAxis(Prev => Prev + step)
            break;
          default:
            break;
        }
    
     };

    const handleZoomIn = () => {
        setZoom(Prev => Prev + 0.03)
    };

    const handleZoomOut = () => {
        setZoom(Prev => Prev - 0.03)
    };
    
    const handleDrag = (e, ui) => {
    const { x, y } = ui;
    setPosition({ x, y });
    setXAxis(x);
    setYAxis(y);
    };

    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleLastNameChange = (e) => {
        setLastName(e.target.value);
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
      

  return (
    <div className="container" style={{maxWidth: "414px", minWidth: "379px" }}>
        <header
        style={{backgroundColor: "#528609", padding: "10px", color: "white" }}
        className='mb-5 headerMain'
        >
      <h3 className="text-center" style={{textTransform: "uppercase", fontFamily: "monospace", fontWeight: "600"}}>Praise God with the Twins 2023</h3>
          
      <h5 className='text-center'>Invitee Selfie Generator</h5>
      <BsPersonFillCheck className="text-center" color='#FFFFFF' size="32"/>
        </header>
        <hr />
      <form ref={form} id="registrationForm" className='position-relative'>
        <div className="form-group">
        <div className='mb-3'><em> <b>NOTICE:</b> This form is specifically for the Twins. If you are not among the twins, <b style={{textDecoration: "underline"}}><Link to="https://pgwt.kennyjonesdesigns.com/reg/">click here</Link></b></em></div>
        <label htmlFor="to_firstname">First Name:</label>
        <input
          type="text"
          className="form-control"
          id="to_firstname"
          name="to_firstname"
          onChange={handleFirstNameChange}
          value={formData.to_firstname}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="to_lastname">Last Name:</label>
        <input
          type="text"
          className="form-control"
          id="to_lastname"
          name="to_lastname"
          onChange={handleLastNameChange}
          value={formData.to_lastname}
          required
        />
      </div>
        <div className="form-group">
          <label htmlFor="to_phone">Phone Number:</label>
          <input type="number" maxLength="11" className="form-control" id="to_phone" name="to_phone" onChange={handleInputChange} value={formData.to_phone} required />
        </div>
        <div className="form-group">
        <label htmlFor="to_email">Email:</label>
        <input type="email" className="form-control" id="to_email" name="to_email" onChange={handleInputChange} value={formData.to_email} required />
        </div>
        <div className="form-group">
        <label htmlFor="to_address">Address:</label>
        <textarea type="te" className="form-control" id="to_address" name="to_address" onChange={handleInputChange} value={formData.to_address} required></textarea>
        </div>
      </form>

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
        <hr />
        <hr />
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
      <div className="postion-relative" style={{marginBottom: "30px"}}>
      <div className="form-group position-relative mt-3 p-0" style={{minHeight: "372px"}} ref={divRef}>
            <div className="">
                <img
                    src={inviteImg}
                    alt="Invite Graphic"
                    className="img-fluid position-absolute"
                    style={{
                        position: 'absolute',
                        top: "0",
                        zIndex: 100000
                    }}
                />
                <div>
                    {image && (
                        <img
                            ref={imageRef}
                            src={image}
                            alt="Uploaded Image"
                            className="img-fluid inviteeAvatar position-absolute top-0"
                            draggable="true"
                            style={{
                                objectFit: "cover",
                                borderRadius: "50%",
                                transform: `scale(${zoom}) translate(${xAxis}px, ${yAxis}px) rotate(${rotation}deg)`,
                                ...crop,
                            }}
                        />
                    )}
                </div>
                <div
                className='inviteeName'
                style={{
                    position: 'absolute',
                    left: "213px",
                    top: "160px",
                    zIndex: 1000000,
                    fontSize: "18px",
                    color: "#FFFFFF",
                    whiteSpace: "normal",
                    lineHeight: "1"
                }}
                >{`${firstName} ${lastName}`}</div>
            </div>
        </div>
        <div className='downloadCTN' style={{
            //  position: "absolute",
            //  bottom: "-100px",
            //  width: "100%"
        }}>
        <button type="submit"
        onClick={handleDownloadClick}
        className="btn btn-block btn-primary mt-3"
        style={{backgroundColor: "#528609", border: "solid 1px #528609", width: "414px"}}
        >
          Download Invite <BsFillCloudDownloadFill className='downloadIcon'/>
        </button>
        </div>
      </div>
      {showPreloader && <Spinner/>}
    </div>
  );
} 

export default EventRegistrationForm;



// import React, { useState } from 'react';

// function EventRegistration() {
//   const [image, setImage] = useState(null);

//   const handleImageChange = (e) => {
//     const selectedImage = e.target.files[0];
//     if (selectedImage) {
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         setImage(e.target.result);
//       };

//       reader.readAsDataURL(selectedImage);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h3 className="text-center mt-5">Praise God with the Twins</h3>
//       <form id="registrationForm">
//         <img src="/img/dd.png" height="auto" width="400" alt="" />
//         <div className="form-group">
//           <label htmlFor="name">Name:</label>
//           <input type="text" className="form-control" id="name" name="name" required />
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email:</label>
//           <input type="email" className="form-control" id="email" name="email" required />
//         </div>

//         <div className="form-group">
//           <label htmlFor="picture">Upload Picture:</label>
//           <input
//             type="file"
//             className="form-control-file"
//             id="picture"
//             name="picture"
//             accept="image/*"
//             required
//             onChange={handleImageChange}
//           />
//         </div>

//         {/* Add a div to display the uploaded image */}
//         <div id="image-container" className="mt-3">
//           {image && (
//             <img
//               id="uploaded-image"
//               src={image}
//               alt="Uploaded Image"
//               draggable="true"
//               style={{ width: '100%' }}
//             />
//           )}
//         </div>

//         <button type="submit" className="btn btn-primary mt-3">Register</button>
//       </form>
//     </div>
//   );
// }

// export default EventRegistration;
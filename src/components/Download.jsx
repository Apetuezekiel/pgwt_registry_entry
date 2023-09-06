import React, { useRef } from 'react';
import html2canvas from 'html2canvas';



function DownloadImage() {
    const divRef = useRef(null);
  
    const handleDownloadClick = () => {
      const divElement = divRef.current;
  
      // Use html2canvas to capture the contents of the div
      html2canvas(divElement).then((canvas) => {
        // Convert the canvas to a data URL
        const dataURL = canvas.toDataURL('image/png');
  
        // Create an anchor element to trigger the download
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'downloaded_image.png';
  
        // Trigger a click event on the anchor element
        a.click();
      });
    };
  
    return (
      <div>
        <div ref={divRef}>
          {/* Place the content you want to capture as an image inside this div */}
          <h1>Capture Me!</h1>
          <p>This is the content you want to download as an image.</p>
        </div>
        <button onClick={handleDownloadClick}>Download Image</button>
      </div>
    );
  }
  
  export default DownloadImage;
  
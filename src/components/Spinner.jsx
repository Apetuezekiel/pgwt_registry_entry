import React from 'react';

const Spinner = () => {
  return (
    <div
      className="position-fixed bottom-0 left-0 d-flex justify-content-center align-items-center"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        height: '100%',
        width: '100%',
        zIndex: '9999', // Adjust the z-index to ensure it's above other content
        overflow: 'hidden', // Prevent scrolling when the spinner is displayed
        zIndex: 1000000
      }}
    >
      <div className="spinner-border text-light" role="status">
        {/* <span className="sr-only">Loading...</span> */}
      </div>
    </div>
  );
};

export default Spinner;

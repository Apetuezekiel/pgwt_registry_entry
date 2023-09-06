import React from 'react';
import pgwt from '../data/imgg/pgwt2023_main.jpg'

const ThankYouPage = () => {
  const pageStyle = {
    // minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    marginTop: "100px"
  };

  const headingStyle = {
    fontSize: '26px',
    marginBottom: '20px',
  };

  const messageStyle = {
    fontSize: '18px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    paddingRight: '10px',
    paddingLeft: '10px'
  };

  const pageCtn = {
    backgroundColor: '#528609',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
    paddingTop: "10px",
    background: "linear-gradient(to bottom, #528609, #0C3709, white)"
  };

  const gridStyle = {
    display: 'grid',
    marginTop: "50px",
    gridTemplateColumns: 'repeat(5, 1fr)', // 5 columns of equal size
    gridTemplateRows: 'repeat(4, 1fr)', // 4 rows of equal size
    gap: '10px', // Adjust the gap between cells as needed
    padding: "30px"
  };

  const cells = Array.from({ length: 20 }, (_, index) => (
    <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img src={pgwt} alt="" style={{ width: '100%', height: '100%' }} />
    </div>
  ));

  return (
    <div style={pageCtn}>
      <img src={pgwt} alt="" height="350px" width="350px"/>
      <div style={pageStyle}>
        <h3 style={headingStyle}>Thank You for Registering!</h3>
        <p style={messageStyle}>
          <strong style={{textTransform: "uppercase"}}>Praise God!</strong><br />
          A mail was sent to your registered mail by Kenny Jones. Kindly check!
        </p>
      </div>
      <div style={gridStyle}>
      {cells}
    </div>
    </div>
  );
};

export default ThankYouPage;

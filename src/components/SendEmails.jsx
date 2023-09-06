import React from 'react';
import emailjs from 'emailjs-com';

const SendEmails = () => {
  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_oe7aw9i', // Replace with your service ID
        'YOUR_TEMPLATE_ID', // Replace with your template ID
        e.target,
        'YOUR_USER_ID' // Replace with your user ID (found on the EmailJS dashboard)
      )
      .then(
        (result) => {
          console.log('Email sent successfully:', result.text);
        },
        (error) => {
          console.error('Error sending email:', error.text);
        }
      );
  };

  return (
    <form onSubmit={sendEmail}>
      <input type="text" name="to_name" placeholder="Recipient Name" />
      <input type="email" name="to_email" placeholder="Recipient Email" />
      <textarea name="message" placeholder="Message" />
      <button type="submit">Send Email</button>
    </form>
  );
};

export default SendEmails;


// import React, { useRef } from 'react';
// import emailjs from '@emailjs/browser';

// export const ContactUs = () => {
//   const form = useRef();

//   const sendEmail = (e) => {
//     e.preventDefault();

//     emailjs.sendForm('service_95ini6l', 'template_22ahgxo', form.current, 'wyrg4E0iNxivYOoTq')
//       .then((result) => {
//           console.log(result.text);
//       }, (error) => {
//           console.log(error.text);
//       });
//   };

//   return (
//     <form ref={form} onSubmit={sendEmail}>
//       <label>Name</label>
//       <input type="text" name="user_name" />
//       <label>Email</label>
//       <input type="email" name="user_email" />
//       <label>Message</label>
//       <textarea name="message" />
//       <input type="submit" value="Send" />
//     </form>
//   );
// };
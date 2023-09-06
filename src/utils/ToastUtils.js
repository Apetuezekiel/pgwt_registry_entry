/* eslint-disable */

import { toast } from "react-toastify";

const showToast = (type, message, time) => {
  switch (type) {
    case "success":
      toast.success(message, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: time,
      });
      break;
    case "warning":
      toast.warn(message, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: time,
      });
      break;
    case "error":
      toast.error(message, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: time,
      });
      break;
    // Add more cases for other types if needed
    default:
      toast(message); // Default to a simple toast
      break;
  }
};

export default showToast;

"use client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToasterProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000} // Auto-close the toast after 3 seconds
      hideProgressBar
      closeOnClick
      pauseOnHover
    />
  );
}

export const showToast = (type: string, message: string) => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "failure":
      toast.error(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast(message);
  }
};

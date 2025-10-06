// components/ErrorIcon.jsx
import { MdError, MdWarning, MdInfo } from "react-icons/md";
import "./ErrorIcon.css";
const ErrorIcon = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  const hasError = errors.some(error => error.severity === 'error');
  const hasWarning = errors.some(error => error.severity === 'warning');
  const hasInfo = errors.some(error => error.severity === 'info');
  
  if (hasError) {
    return <MdError color={"#EB5031"} size={20} className="error-icon" alt="Error"/>;
  } else if (hasWarning) {
    return <MdWarning color={"#FF9800"} size={20} className="warning-icon" alt="Warning"/>;
  } else if (hasInfo) {
    return <MdInfo color={"#2196F3"} size={20} className="info-icon" alt="Info"/>;
  }
  
  return null;
};

export default ErrorIcon;
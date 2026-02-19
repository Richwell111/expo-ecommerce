import { useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, InfoIcon } from "lucide-react";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getAlertClass = () => {
    switch (type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      default:
        return "alert-info";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "error":
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="toast toast-bottom toast-end z-50">
      <div className={`alert ${getAlertClass()}`}>
        {getIcon()}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;

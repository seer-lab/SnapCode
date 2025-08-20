import './SolidButton.css'; 

const SolidButton = ({ children, onClick, disabled, color }) => {
  const buttonStyle = {
    backgroundColor: color || '#444ad4'
  };

  return (
    <button
      className="solid-button"
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};

export default SolidButton;
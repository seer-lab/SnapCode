import './OutlineButton.css'; // Be sure the filename matches

const OutlineButton = ({ children, onClick, disabled }) => {
  return (
    <button
      className="outline-button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default OutlineButton;
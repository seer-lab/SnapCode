// components/CompletionModal.jsx
import BottomModal from "../BottomModal/BottomModal";

const CompletionModal = ({ isOpen, onClose }) => {
  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Exercise is Completed"
    >
      <div className="camera-action-modal-content">
        <div style={{ 
          textAlign: 'center',
          color: '#555',
          fontSize: '1.2rem'
        }}>
          This exercise is already marked as completed. If you want to replace or add more code, you can switch it back to incomplete at the output page.
        </div>
      </div>
    </BottomModal>
  );
};

export default CompletionModal;
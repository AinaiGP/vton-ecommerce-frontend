import React from 'react';
import Modal from './Modal';
import styles from '../../styles/Modal.module.css'; // We'll reuse button styles or define standard ones.

// If you have standard button styles in a separate CSS module, you can import them.
// For now, using standard class names that might exist or inline styles as a fallback.
const btnStyle = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '14px',
};

const primaryBtnStyle = {
  ...btnStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const dangerBtnStyle = {
  ...btnStyle,
  backgroundColor: '#ef4444',
  color: '#fff',
};

const secondaryBtnStyle = {
  ...btnStyle,
  backgroundColor: '#f3f4f6',
  color: '#374151',
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
  children,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ padding: '10px 0' }}>
        {message && <p style={{ marginBottom: '16px', color: '#4b5563', lineHeight: '1.5' }}>{message}</p>}
        
        {/* Render any additional inputs/children here */}
        {children && <div style={{ marginBottom: '20px' }}>{children}</div>}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button 
            onClick={onClose} 
            style={secondaryBtnStyle}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            style={isDanger ? dangerBtnStyle : primaryBtnStyle}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

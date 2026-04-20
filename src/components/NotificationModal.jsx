import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, message, title = "Notice" }) => {
    if (!isOpen) return null;

    return (
        <div className="notification-overlay" onClick={onClose}>
            <div className="notification-content" onClick={e => e.stopPropagation()}>
                <div className="notification-header">
                    <div className="notification-icon">
                        <i className="fa-solid fa-circle-info"></i>
                    </div>
                    <h3>{title}</h3>
                </div>
                <p className="notification-message">{message}</p>
                <button className="notification-btn" onClick={onClose}>Understood</button>
            </div>
        </div>
    );
};

export default NotificationModal;

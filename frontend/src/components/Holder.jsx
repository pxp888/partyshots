import React from 'react';
import './Holder.css';

const Holder = ({ children, className = '' }) => {
    return (
        <div className={`holder ${className}`}>
            {children}
        </div>
    );
};

export default Holder;

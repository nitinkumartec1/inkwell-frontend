import React from 'react';

const Loader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column' }}>
      <div 
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--border-color, #e5e7eb)',
          borderTop: '4px solid var(--primary-color, #3b82f6)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      ></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary, #6b7280)' }}>Loading...</p>
    </div>
  );
};

export default Loader;

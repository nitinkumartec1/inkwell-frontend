import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Page Not Found</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--primary-color, #3b82f6)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '500'
        }}
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;

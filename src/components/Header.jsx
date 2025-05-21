// src/components/Header.jsx
import React from 'react';

const Header = ({ title }) => {
  return (
    <div className="header">
      <h1 style={{ margin: 0, fontSize: '20px' }}>{title}</h1>
    </div>
  );
};

export default Header;
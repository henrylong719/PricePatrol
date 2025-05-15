import React from 'react';
import Button from 'react-bootstrap/esm/Button';
import { useNavigate } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(-1)} className="btn btn-light my-3">
      Go Back
    </Button>
  );
};

export default BackButton;

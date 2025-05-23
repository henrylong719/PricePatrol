import React from 'react';
import { Button } from 'react-bootstrap';
import { IoPaperPlaneOutline } from 'react-icons/io5';

type ShareButtonProps = {
  onClick?: () => void;
};

const ShareButton: React.FC<ShareButtonProps> = ({ onClick = () => {} }) => {
  return (
    <Button
      variant="light"
      onClick={onClick}
      className="p-0 border rounded-circle d-flex justify-content-center align-items-center"
      style={{ width: '45px', height: '45px' }}
    >
      <IoPaperPlaneOutline size={20} className="text-secondary" />
    </Button>
  );
};

export default ShareButton;

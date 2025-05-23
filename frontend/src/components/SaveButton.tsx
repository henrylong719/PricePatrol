import React from 'react';
import { Button } from 'react-bootstrap';
import { AiOutlineSave } from 'react-icons/ai';

type SaveButtonProps = {
  onClick?: () => void;
};

const SaveButton: React.FC<SaveButtonProps> = ({ onClick = () => {} }) => (
  <Button
    variant="light"
    onClick={onClick}
    className="p-0 border rounded-circle d-flex justify-content-center align-items-center"
    style={{ width: '45px', height: '45px' }}
  >
    <AiOutlineSave size={20} className="text-secondary" />
  </Button>
);

export default SaveButton;

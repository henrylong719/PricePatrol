import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ConfirmModal({
  title,
  description,
  show,
  setShow,
  onConfirm,
}: {
  title: string;
  description: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onConfirm: () => void;
}) {
  const handleClose = () => setShow(false);

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{description}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="link"
            onClick={handleClose}
            className="px-3 py-2"
            style={{ color: '#000000', textDecoration: 'none' }}
          >
            No
          </Button>
          <Button variant="dark" onClick={onConfirm} className="px-3 py-2">
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ConfirmModal;

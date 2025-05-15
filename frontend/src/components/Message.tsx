import { Alert } from 'react-bootstrap';

const Message = ({
  variant = 'info',
  children,
}: {
  variant: string;
  children: string;
}) => {
  return <Alert variant={variant}>{children}</Alert>;
};

export default Message;

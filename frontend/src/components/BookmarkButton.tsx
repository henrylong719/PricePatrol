import React, { useState, type CSSProperties } from 'react';
import { CiBookmark } from 'react-icons/ci';

type BookmarkButtonProps = {
  onClick?: () => void;
};

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  onClick = () => {},
}) => {
  const [hover, setHover] = useState(false);

  const styles = {
    btn: {
      width: '45px',
      height: '45px',
      border: '1px solid #DAD8D9',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'background-color 0.2s ease',
      backgroundColor: hover ? '#EEEEEE' : 'transparent',
    } as CSSProperties,
    icon: {
      color: '#777777',
    } as CSSProperties,
  };

  return (
    <div
      style={styles.btn}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <CiBookmark size={24} style={styles.icon} />
    </div>
  );
};

export default BookmarkButton;

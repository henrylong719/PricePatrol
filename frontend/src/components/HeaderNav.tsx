import type { CSSProperties } from 'react';
import { Nav, NavDropdown } from 'react-bootstrap';
import type { IUser } from '../interfaces';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaRegListAlt } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { LuClipboardList } from 'react-icons/lu';
import { FaUsersBetweenLines } from 'react-icons/fa6';

const HeaderNav = ({
  userInfo,
  logoutHandler,
}: {
  userInfo: IUser;
  logoutHandler: () => void;
}) => {
  const navigate = useNavigate();

  const onCreateWatching = () => {
    if (!userInfo) {
      toast.warning('Please sign in to create a watch!');
      return navigate('/login');
    }
    navigate('/watches/create');
  };

  return (
    <>
      <style>
        {`
          .nav-dropdown-item:hover {
            color: #383939 !important;
          }
        `}
      </style>
      <Nav className="ms-auto">
        {userInfo ? (
          <NavDropdown title={userInfo.name} id="username">
            <NavDropdown.Item className="d-lg-none" onClick={onCreateWatching}>
              Add New Watch
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to={`/user`}
              className="nav-dropdown-item"
              style={styles.navItemStyles}
            >
              <CgProfile className="icon" fontSize={'1.2rem'} />
              Profile
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to={`/user/products`}
              className="nav-dropdown-item"
              style={styles.navItemStyles}
            >
              <FaRegListAlt className="icon" fontSize={'1.2rem'} />
              My Watches
            </NavDropdown.Item>
            <NavDropdown.Item
              onClick={logoutHandler}
              className="nav-dropdown-item"
              style={styles.navItemStyles}
            >
              <FiLogOut fontSize={'1.2rem'} />
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        ) : (
          <Nav.Link as={Link} to="/login" style={styles.signInLink}>
            Sign In
          </Nav.Link>
        )}
        {userInfo && userInfo.roles.includes('admin') && (
          <NavDropdown title="Admin" id="adminmenu">
            <NavDropdown.Item
              as={Link}
              to="/admin/watches"
              className="nav-dropdown-item"
              style={styles.navItemStyles}
            >
              <LuClipboardList fontSize={'1.2rem'} />
              Watches
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/admin/users"
              className="nav-dropdown-item"
              style={styles.navItemStyles}
            >
              <FaUsersBetweenLines fontSize={'1.2rem'} />
              Users
            </NavDropdown.Item>
          </NavDropdown>
        )}
      </Nav>
    </>
  );
};

const styles = {
  signInLink: {
    fontSize: '1.2rem',
  } as CSSProperties,
  navItemStyles: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: '#808080',
  } as CSSProperties,
};

export default HeaderNav;

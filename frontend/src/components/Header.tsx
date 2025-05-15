import { Navbar, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { IUser } from '../interfaces';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import type { CSSProperties } from 'react';
import HeaderNav from './HeaderNav';

const Header: React.FC = () => {
  const { userInfo } = useSelector(
    (state: { auth: { userInfo: IUser } }) => state.auth
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <header>
      <Navbar
        className="py-4"
        bg="light"
        variant="light"
        expand="lg"
        collapseOnSelect
      >
        <Container>
          <Navbar.Brand style={styles.brand} as={Link} to="/">
            Price Patrol
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <HeaderNav userInfo={userInfo} logoutHandler={logoutHandler} />
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

const styles = {
  brand: {
    fontSize: '2.5rem',
    color: '#004AAD',
  } as CSSProperties,
  signInLink: {
    fontSize: '1.2rem',
  } as CSSProperties,
};
export default Header;

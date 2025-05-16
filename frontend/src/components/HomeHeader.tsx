import React, { type CSSProperties } from 'react';
import { Navbar, Container, Row, Col, Image } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { IUser } from '../interfaces';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import HeaderNav from './HeaderNav';
import header_Image from '../assets/header_Image.jpg';

const HomeHeader: React.FC = () => {
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
    <header style={styles.header}>
      <style>
        {`
          .top-110 {
            top: 110px;
          }
          @media (min-width: 1800px) {
            .top-md-155 {
              top: 155px;
            }
          }
        `}
      </style>
      <div style={styles.headerImageContainer}>
        <Image
          style={styles.headerImage}
          src={header_Image}
          alt="background image"
          fluid
        />

        <div className="position-absolute w-100 d-flex justify-content-center top-md-155 top-110">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} md={9} lg={8}>
                <p style={styles.brandDescription}>
                  Always on guard for the best deal.
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <Navbar className="py-4 navbar-dark" expand="lg" collapseOnSelect>
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
  header: {
    height: '45vh',
  } as CSSProperties,
  brandDescription: {
    fontSize: '2.4rem',
    textAlign: 'center',
    paddingBottom: '2.1rem',
    color: '#ffffff',
    fontWeight: 600,
  } as CSSProperties,
  headerImageContainer: {
    position: 'relative',
  } as CSSProperties,
  headerImage: {
    height: '40vh',
    width: '100vw',
    objectFit: 'cover',
    filter: 'brightness(0.75)',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  } as CSSProperties,

  brand: {
    fontSize: '2.3rem',
  } as CSSProperties,
  signInLink: {
    color: '#fff',
    fontSize: '1.2rem',
  } as CSSProperties,
};

export default HomeHeader;

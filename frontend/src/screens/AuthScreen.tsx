import React, { useState, useEffect, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Col, Container, Card, Row, Image } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import {
  //   useLoginFacebookMutation,
  //   useLoginGoogleMutation,
  useLoginMutation,
  useRegisterMutation,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import type { IUser } from '../interfaces';
import AuthForm from '../components/AuthForm';
// import SocialLoginButtons from '../components/SocialLoginButtons';
// const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string;
import PricePatrol_logo from '../assets/PricePatrol_logo.png';

interface AuthScreenProps {
  isRegister?: boolean;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ isRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  //   const [googleLogin, { isLoading: isGoogleLoading }] =
  //     useLoginGoogleMutation();
  //   const [facebookLogin, { isLoading: isFacebookLoading }] =
  //     useLoginFacebookMutation();

  const { userInfo } = useSelector(
    (state: { auth: { userInfo: IUser } }) => state.auth
  );

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!email || !password || (isRegister && !name)) {
        return toast.error('Please provide a valid email, password, and name.');
      }

      const res = isRegister
        ? await register({ name, email, password }).unwrap()
        : await login({ email, password }).unwrap();

      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: '90vh' }}
    >
      <Col xs={12} sm={10} md={8} lg={6} xl={5}>
        <Card className="my-2 rounded px-4 pb-5">
          <div className="px-4">
            <div className="text-center">
              <Link to={'/'}>
                <Image
                  fluid
                  src={PricePatrol_logo}
                  alt="PricePatrol"
                  width="80%"
                />
              </Link>
            </div>
            <h3 className="text-center">
              {isRegister ? 'Sign up' : 'Sign in'}
            </h3>

            <AuthForm
              email={email}
              password={password}
              name={name}
              isLoading={isRegister ? isRegisterLoading : isLoginLoading}
              handleEmailChange={(e) => setEmail(e.target.value)}
              handlePasswordChange={(e) => setPassword(e.target.value)}
              handleNameChange={(e) => setName(e.target.value)}
              handleSubmit={submitHandler}
              isRegister={isRegister}
            />

            <Row className="px-5 py-3">
              <Col className="d-flex justify-content-center mt-3 gap-2">
                {isRegister ? (
                  <>
                    Already have an account?{' '}
                    <Link
                      to={redirect ? `/login?redirect=${redirect}` : '/login'}
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    New Customer?{' '}
                    <Link
                      to={
                        redirect
                          ? `/register?redirect=${redirect}`
                          : '/register'
                      }
                    >
                      Register now
                    </Link>
                  </>
                )}
              </Col>
            </Row>

            {(isRegisterLoading || isLoginLoading) && (
              //   ||  isGoogleLoading ||
              //   isFacebookLoading
              <div style={{ margin: '1rem' }}>
                <Loader />
              </div>
            )}
          </div>

          <hr />

          {/* <SocialLoginButtons
            onGoogleLogin={onGoogleLogin}
            onFacebookLoginSuccess={onFaceBookSuccess}
            onFacebookLoginError={onFacebookError}
            facebookAppId={facebookAppId}
          /> */}
        </Card>
      </Col>
    </Container>
  );
};

export default AuthScreen;

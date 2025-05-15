import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container } from 'react-bootstrap';
import Footer from './components/Footer';
import HomeHeader from './components/HomeHeader';
import Header from './components/Header';

function App() {
  const { pathname } = useLocation();

  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      <ToastContainer />
      <main>
        {!isAuthPage && (isHomePage ? <HomeHeader /> : <Header />)}
        {isAuthPage ? (
          <Outlet />
        ) : (
          <Container>
            <Outlet />
          </Container>
        )}
      </main>
      <Footer />
    </>
  );
}

export default App;

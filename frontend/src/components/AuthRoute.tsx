import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { IUser } from '../interfaces';

const AuthRoute: React.FC = () => {
  const { userInfo } = useSelector(
    (state: { auth: { userInfo: IUser } }) => state.auth
  );
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};
export default AuthRoute;

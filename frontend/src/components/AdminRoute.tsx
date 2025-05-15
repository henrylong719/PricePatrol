import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { IUser } from '../interfaces';

const AdminRoute: React.FC = () => {
  const { userInfo } = useSelector(
    (state: { auth: { userInfo: IUser } }) => state.auth
  );
  return userInfo && userInfo.roles.includes('admin') ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};
export default AdminRoute;

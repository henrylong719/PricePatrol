import { StrictMode } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx';
import './assets/styles/index.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store.ts';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';
import HomeScreen from './screens/HomeScreen.tsx';
import AuthScreen from './screens/AuthScreen.tsx';
import AuthRoute from './components/AuthRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import UserWatchListScreen from './screens/UserWatchListScreen.tsx';

// const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />

      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<AuthScreen isRegister={false} />} />
      <Route path="/register" element={<AuthScreen isRegister={true} />} />

      {/* Signed in users */}
      <Route path="user" element={<AuthRoute />}>
        <Route path="watches" element={<UserWatchListScreen />} />
      </Route>

      {/* Admin users */}
      <Route path="" element={<AdminRoute />}></Route>
      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Route>
  )
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);

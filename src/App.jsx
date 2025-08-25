import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ToolsPage } from "./pages/ToolsPage";
import { SettingsPage } from "./pages/SettingsPage";

import { OrderPage } from "./pages/OrderPage";
import { OrderDetails } from "./pages/OrderDetails";

import { SalesPage } from "./pages/SalesPageV2";

import { MenuSettingPage } from "./pages/MenuSettingPage";
import { ChooseMenuPage } from "./pages/ChooseMenuPage";
import { EditMenuPage } from "./pages/EditMenuPage";
import { AddMenuPage } from "./pages/AddMenuPage";

import { UserSettingsPage } from "./pages/UsersSettingPage";
import { AddUsersPage } from "./pages/AddUsersPage";
import { EditUsersPage } from "./pages/EditUsersPage";

import { Notfound } from "./pages/NotFound";

import ScrollToTop from "./components/ScrollToTop";

import RequireAuth from "../hooks/RequireAuth";
import ProtectedRoute from "../hooks/ProtectedRoute";

import OrderListener from "./components/OrderListener";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

function App() {
  const { user } = useAuth();

  return (
    <>
      <BrowserRouter>
        {user && <OrderListener />}
        <ToastContainer position="top-right" closeButton={false} />
        <ScrollToTop />
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>

            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin', 'super admin']}>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/orderDetail/:id" element={<OrderDetails />} />

            <Route path="/userSettings" element={
              <ProtectedRoute allowedRoles={['super admin']}>
                <UserSettingsPage />
              </ProtectedRoute>} />
            <Route path="/addUsers" element={<AddUsersPage />} />
            <Route path="/editUsers" element={
              <ProtectedRoute allowedRoles={['super admin']}>
                <EditUsersPage />
              </ProtectedRoute>} />

            <Route path="/menuSetting" element={
              <ProtectedRoute allowedRoles={['admin', 'super admin']}>
                <MenuSettingPage />
              </ProtectedRoute>} />
            <Route path="/ChooseMenu" element={
              <ProtectedRoute allowedRoles={['admin', 'super admin']}>
                <ChooseMenuPage />
              </ProtectedRoute>} />
            <Route path="/editMenu" element={
              <ProtectedRoute allowedRoles={['admin', 'super admin']}>
                <EditMenuPage />
              </ProtectedRoute>} />
            <Route path="/addMenu" element={
              <ProtectedRoute allowedRoles={['admin', 'super admin']}>
                <AddMenuPage />
              </ProtectedRoute>} />
            <Route path="*" element={<Notfound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
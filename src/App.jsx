import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ToolsPage } from "./pages/ToolsPage";
import { SettingsPage } from "./pages/SettingsPage";

import { OrderPage } from "./pages/OrderPage";
import { OrderDetails } from "./pages/OrderDetails";

import { MenuSettingPage } from "./pages/MenuSettingPage";
import { ChooseMenuPage } from "./pages/ChooseMenuPage";
import { EditMenuPage } from "./pages/EditMenuPage";
import { AddMenuPage } from "./pages/AddMenuPage";

import { EditUserPage } from "./pages/EditUserPage";

import ScrollToTop from "./components/ScrollToTop";

import RequireAuth from "../hooks/RequireAuth";

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
          <Route path="/tools" element={
            <RequireAuth>
              <ToolsPage />
            </RequireAuth>
          } />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orderDetail/:id" element={<OrderDetails />} />
          <Route path="/menuSetting" element={<MenuSettingPage />} />
          <Route path="/ChooseMenu" element={<ChooseMenuPage />} />
          <Route path="/editMenu" element={<EditMenuPage />} />
          <Route path="/addMenu" element={<AddMenuPage />} />
          <Route path="/editUser" element={<EditUserPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
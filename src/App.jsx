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
import { AddUsersPage } from "./pages/addUsersPage";
import { EditUsersPage } from "./pages/EditUsersPage";

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
          <Route element={<RequireAuth />}>

            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/orderDetail/:id" element={<OrderDetails />} />

            <Route path="/userSettings" element={<UserSettingsPage />} />
            <Route path="/addUsers" element={<AddUsersPage />} />
            <Route path="/editUsers" element={<EditUsersPage />} />
            
            <Route path="/menuSetting" element={<MenuSettingPage />} />
            <Route path="/ChooseMenu" element={<ChooseMenuPage />} />
            <Route path="/editMenu" element={<EditMenuPage />} />
            <Route path="/addMenu" element={<AddMenuPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
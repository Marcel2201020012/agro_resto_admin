import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ToolsPage } from "./pages/ToolsPage";
import { OrderPage } from "./pages/OrderPage";
import { SalesPage } from "./pages/SalesPage";
import { EditMenuPage } from "./pages/EditMenuPage";
import { OrderDetails } from "./pages/OrderDetails";

import RequireAuth from "../hooks/RequireAuth";

import OrderListener from "./components/OrderListener";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
        <OrderListener />
        <ToastContainer position="top-right" closeButton={false}/>
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tools" element={
            <RequireAuth>
              <ToolsPage />
            </RequireAuth>
          } />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orderDetail/:id" element={<OrderDetails />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/edit" element={<EditMenuPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
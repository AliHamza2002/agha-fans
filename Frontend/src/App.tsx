import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRedirect } from "./components/RoleBasedRedirect";
import { ToastContainer } from "./components/Toast";
import { LocalBuyerProvider } from "./contexts/LocalBuyerContext";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import Parties from "./pages/Parties";
import Reports from "./pages/Reports";
import Finished from "./pages/Finished";
import LocalBuyer from "./pages/LocalBuyer";
import Sales from "./pages/Sales";
import SalesPartyDetails from "./pages/SalesPartyDetails";
import Purchase from "./pages/Purchase";
import PurchasePartyDetails from "./pages/PurchasePartyDetails";
import Receipt from "./pages/Receipt";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

export default function App() {
  return (
    <LocalBuyerProvider>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/materials"
                    element={
                      <ProtectedRoute allowedRoles={["Admin", "StoreBoy"]}>
                        <Materials />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/parties"
                    element={
                      <ProtectedRoute allowedRoles={["Admin", "StoreBoy"]}>
                        <Parties />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finished"
                    element={
                      <ProtectedRoute allowedRoles={["Admin", "FinalBoy"]}>
                        <Finished />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <Sales />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/party-details/:partyId"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <SalesPartyDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <Purchase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/party-details/:partyId"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <PurchasePartyDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/local-buyer"
                    element={
                      <ProtectedRoute allowedRoles={["Admin", "StoreBoy"]}>
                        <LocalBuyer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/receipt"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <Receipt />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<RoleBasedRedirect />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </LocalBuyerProvider>
  );
}

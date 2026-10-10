import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./state/auth";
import { StoreProvider } from "./state/store";
import { RequireAdmin } from "./components/ProtectedRoute";
import Layout, { ScrollToTop } from "./components/Layout";
import Home from "./pages/Home";
import Creators from "./pages/Creators";
import CreatorProfile from "./pages/CreatorProfile";
import BriefNew from "./pages/BriefNew";
import Briefs from "./pages/Briefs";
import BriefDetail from "./pages/BriefDetail";
import Inbox from "./pages/Inbox";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/creators" element={<Creators />} />
      <Route path="/creator/:id" element={<CreatorProfile />} />
      <Route path="/brief/new" element={<BriefNew />} />
      <Route path="/briefs" element={<Briefs />} />
      <Route path="/brief/:id" element={<BriefDetail />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ScrollToTop />
        <Layout>
          <AppRoutes />
        </Layout>
      </StoreProvider>
    </AuthProvider>
  );
}

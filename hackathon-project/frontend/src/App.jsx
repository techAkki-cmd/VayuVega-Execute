import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Loginpage from "./pages/Loginpage";
import Signuppage from "./pages/Signuppage";
import Dashboardpage from "./pages/Dashboardpage";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import { Toaster } from "sonner";
import { useSupabaseAuth } from "./context/SupabaseAuthContext";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HeaderBasic>
              <Homepage />
            </HeaderBasic>
          }
        />
        <Route
          path="/login"
          element={
            <HeaderBasic>
              <Loginpage />
            </HeaderBasic>
          }
        />
        <Route
          path="/signup/*"
          element={
            <HeaderBasic>
              <Signuppage />
            </HeaderBasic>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboardpage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Footer />
    </>
  );
}

const HeaderBasic = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">
      {children}
    </main>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { loading, user } = useSupabaseAuth();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return children;
};

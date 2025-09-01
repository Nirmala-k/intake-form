import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import PatientIntakeForm from "./components/PatientIntakeForm";
import LoginPopup from "./components/Login_popup";

const ProtectedRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ 
  children, 
  isAuthenticated 
}) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<boolean>(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPopup setAuth={setAuth} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={auth}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
                <PatientIntakeForm />
              </div>
            </ProtectedRoute>
          }
        />
        <Route 
          path="*" 
          element={<Navigate to={auth ? "/" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};
export default App;

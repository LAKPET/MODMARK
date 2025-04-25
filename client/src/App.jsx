import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/route";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from "./routes/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

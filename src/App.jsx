import React from "react";
import Routes from "./Routes";
import { VehicleProvider } from "./contexts/VehicleContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";

function App() {
  return (
    <AdminAuthProvider>
      <VehicleProvider>
        <Routes />
      </VehicleProvider>
    </AdminAuthProvider>
  );
}

export default App;

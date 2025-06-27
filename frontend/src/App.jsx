import HomePage from "./pages/HomePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-100 text-white">
        <div className="flex">
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

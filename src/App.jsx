import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase-config"; // Asegúrate de importar tu configuración de Firebase
import "./App.css";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import CourseA1 from "./components/Courses/CourseA1";
import CourseA2 from "./components/Courses/CourseA2";
import TestLevelA1 from "./components/Courses/Test/TestLevelA1";
import TestLevelA2 from "./components/Courses/Test/TestLevelA2";
import Forum from "./components/pages/Forum";
import FriendLists from "./components/Friends/FriendLists";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Observar cambios en la autenticación de Firebase
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Si el usuario está autenticado, lo envía al Dashboard, de lo contrario lo manda a Login */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

                <Route path="/CourseA1" element={< CourseA1 />} />
                <Route path="/CourseA2" element={< CourseA2 />} />

                <Route path="/TestLevelA1" element={< TestLevelA1 />} />

                <Route path="/TestLevelA2" element={< TestLevelA2 />} />

                <Route path="/Forum" element={< Forum />} />
                <Route path="/FriendLists" element={< FriendLists />} />

                



               

      </Routes>
    </Router>
  );
}

export default App;

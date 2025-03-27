import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import "./Dashboard.css";
import Navbar from "../BasicComponents/Navbar/Navbar";
import Sidebar from "../BasicComponents/Sidebar/Sidebar";
import Courses from "../BasicComponents/Main/Courses";
import Schedule from "../BasicComponents/Main/Schedule";
import FriendLists from "../Friends/FriendLists";

function Dashboard() {
  const [currentUserUid, setCurrentUserUid] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Usuario autenticado:", user.uid);
        setCurrentUserUid(user.uid);
      } else {
        console.warn("⚠ No hay usuario autenticado.");
        setCurrentUserUid(null);
      }
    });
  }, []);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <Navbar />
      </nav>

      <main className="main">
        <Courses />
        <Schedule />
        {currentUserUid ? (
          <FriendLists currentUserUid={currentUserUid} />
        ) : (
          <p>Inicia sesión para ver sugerencias de amigos.</p>
        )}
      </main>

      <aside className="aside">
        <Sidebar />
      </aside>
    </div>
  );
}

export default Dashboard;

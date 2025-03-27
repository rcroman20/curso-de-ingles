import React, { useState, useEffect } from "react";
import Navbar from "../BasicComponents/Navbar/Navbar";
import Sidebar from "../BasicComponents/Sidebar/Sidebar";
import "./CourseA1.css";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

function CourseA2() {
  const [testTaken, setTestTaken] = useState(false);
  const auth = getAuth();
  const rtdb = getDatabase();

  useEffect(() => {
    const checkTestStatus = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("User status:", user);  // Verifica si el usuario está autenticado
        if (user) {
          const userResultsRef = ref(rtdb, 'resultsExamA2/' + user.uid);  // Verifica si los resultados ya existen
          const snapshot = await get(userResultsRef);
          if (snapshot.exists()) {
            console.log("Test results found:", snapshot.val());  // Muestra los resultados en consola
            setTestTaken(true);
          } else {
            console.log("No test results found for this user");
            setTestTaken(false);
          }
        }
      });

      // Cleanup the subscription when the component is unmounted or dependencies change
      return () => unsubscribe();
    };

    checkTestStatus();
  }, [auth, rtdb]);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <Navbar />
      </nav>

      <main className="main">
        <h2>Course A2</h2>

        <div className="cards-container">
          {/* Card de Test */}
          <div className="card">
            <h3>Test</h3>
            <p>Realiza pruebas para evaluar tu conocimiento.</p>
            <img
              src="https://projects-2025.web.app/assest/img/english-class.png"
              alt=""
            />
            <br />
            {!testTaken && <a href="./TestLevelA2">ir</a>}  {/* Solo muestra el botón "ir" si no ha sido tomado */}
            {testTaken ? (
              <p>You have taken this test before!

              </p>
            ) : (
              <p>This test is available to take it!</p>
            )}
          </div>
        </div>
      </main>

      <aside className="aside">
        <Sidebar />
      </aside>
    </div>
  );
}

export default CourseA2;

import React, { useState, useEffect } from "react";
import Navbar from "../BasicComponents/Navbar/Navbar";
import Sidebar from "../BasicComponents/Sidebar/Sidebar";
import "./CourseA1.css";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

function CoursesA1() {
  const [testTaken, setTestTaken] = useState(false);
  const auth = getAuth();
  const rtdb = getDatabase();

  useEffect(() => {
    const checkTestStatus = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("User status:", user);  // Verifica si el usuario está autenticado
        if (user) {
          const userResultsRef = ref(rtdb, 'resultsExamA1/' + user.uid);  // Verifica si los resultados ya existen
          const snapshot = await get(userResultsRef);
          if (snapshot.exists()) {
            console.log("Test results found:", snapshot.val());  
            setTestTaken(true);
          } else {
            console.log("No test results found for this user");
            setTestTaken(false);
          }
        }
      });

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
        <h2 className="title-course">Course A1: Beginner</h2>

        <div className="cards-container">
          {/* Card de Test */}
          <div className="card">
            <h3>English Test</h3>
            <p>Take this test to assess and showcase your skills.</p>
            <img
              src="https://lh3.googleusercontent.com/a/ACg8ocIXHBfXAbVfvhbzaQCq7xISpJJuGRkCqBiiwnWSDB5_IWcYbP0=s600-c"
              alt=""
            />
            <br />
            {!testTaken && <a href="./TestLevelA1">Take the test</a>}  {/* Solo muestra el botón "ir" si no ha sido tomado */}
            {testTaken ? (
              <p>You have taken this test before!</p>
            ) : (
              <p>The test is available to take it!</p>
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

export default CoursesA1;

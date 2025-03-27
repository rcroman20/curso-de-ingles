import React, { useState, useEffect } from "react";
import {
  getFirestore,

} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js"; // Importamos Realtime Database
import Navbar from "../../BasicComponents/Navbar/Navbar";
import Sidebar from "../../BasicComponents/Sidebar/Sidebar";
import "./TestLevelA1.css";
import "../../../../firebase-config";

const TestLevelA1 = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [testTaken, setTestTaken] = useState(false); // State to track if test is taken

  const auth = getAuth();
  const db = getFirestore();
  const rtdb = getDatabase(); // Inicializamos Realtime Database

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = ref(rtdb, "tests/A1/questions");
        const snapshot = await get(questionsRef);

        if (!snapshot.exists()) {
          console.error(
            "⚠ No hay preguntas disponibles en la Realtime Database."
          );
          return;
        }

        const questionsData = snapshot.val();

        // Verificamos que `questionsData` sea un objeto antes de procesarlo
        if (!questionsData || typeof questionsData !== "object") {
          console.error("⚠ Error: Formato de preguntas incorrecto.");
          return;
        }

        // Convertimos `options` a un array
        const fetchedQuestions = Object.values(questionsData).map((q) => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options // Si ya es un array, lo dejamos igual
            : typeof q.options === "string"
            ? q.options.split(",").map((opt) => opt.trim()) // Convertimos string a array
            : [],
        }));

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("❌ Error al obtener las preguntas:", error);
      }
    };

    const checkIfTestTaken = async (userId) => {
      const userResultsRef = ref(rtdb, "resultsExamA1/" + userId); // Reference to user's test results
      const snapshot = await get(userResultsRef);
      if (snapshot.exists()) {
        setTestTaken(true); // Set testTaken to true if results already exist
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchQuestions();
        checkIfTestTaken(user.uid); // Check if test is already taken
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleSelectAnswer = (questionIndex, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async () => {
    // Lógica para avanzar a la siguiente pregunta
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });
    const totalPoints = correctAnswers; // Puntos = respuestas correctas
    return { totalPoints, correctAnswers, incorrectAnswers };
  };

  const saveResultsToDatabase = () => {
    if (!testTaken) {
      // Prevent saving results if test is already taken
      const { totalPoints, correctAnswers, incorrectAnswers } =
        calculateResults();
      const date = new Date().toLocaleString(); // Fecha y hora de la prueba

      if (user) {
        const userResultsRef = ref(rtdb, "resultsExamA1/" + user.uid); // Referencia para guardar los resultados

        set(userResultsRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          date,
          totalPoints,
          correctAnswers,
          incorrectAnswers,
        })
          .then(() => {
            console.log("Results saved to Realtime Database!");

            // Redirigir a Facebook después de guardar los resultados
            window.location.href = "/CourseA1";
          })
          .catch((error) => {
            console.error("Error saving results to Realtime Database:", error);
          });
      }
    }
  };

  const progressPercentage = Math.floor(
    (currentQuestionIndex / questions.length) * 100
  );

  return (
    <div className="dashboard-questions">
      <nav className="navbar">
        <Navbar />
      </nav>
      <main className="main">
        <section className="question-section">
          {/* Barra de Progreso */}
          <div className="progress-bar">
            <div
              className="progress-bar-filled"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Show test taken message if the test is already completed */}
          {testTaken ? (
            <div>
              <p className="finish-message">Ya has completado este examen.</p>
            </div>
          ) : (
            <>
              {currentQuestionIndex < questions.length ? (
                <div className="question">
                  {/* Mostrar título y descripción */}
                  <h3 className="question-title">Level A1</h3>
                  <p className="question-description">
                    Test de nivel A1, 10 preguntas
                  </p>
                  <h4 className="question-text">
                    {questions[currentQuestionIndex].question}
                  </h4>

                  <div className="options-answers">
                    {Array.isArray(questions[currentQuestionIndex].options) ? (
                      questions[currentQuestionIndex].options.map(
                        (option, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleSelectAnswer(currentQuestionIndex, option)
                            }
                            className={
                              userAnswers[currentQuestionIndex] === option
                                ? "selected"
                                : ""
                            }
                          >
                            {option}
                          </button>
                        )
                      )
                    ) : (
                      <p>Options are not available or in the wrong format.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p></p>
              )}

              {/* Botón de Enviar */}
              {currentQuestionIndex < questions.length && (
                <div className="submit-button-container">
                  <button onClick={handleSubmit} className="submit-button">
                    Submit Answer
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mensaje de finalización */}
          {currentQuestionIndex >= questions.length && !testTaken && (
            <div>
              <p className="finish-message">You have finished the test!</p>
              <button onClick={saveResultsToDatabase} className="submit-button">
                Save Answers
              </button>
            </div>
          )}
        </section>
      </main>
      <aside className="aside">
        <Sidebar />
      </aside>
    </div>
  );
};

export default TestLevelA1;

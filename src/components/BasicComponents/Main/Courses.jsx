import React, { useState, useEffect } from "react";
import { GraduationCap, User } from "lucide-react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { firebaseConfig } from '../../../../firebase-config';
import './Courses.css'

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

const Courses = () => {
  const [userCourses, setUserCourses] = useState([]); // Estado para los cursos del usuario
  const [userResults, setUserResults] = useState(null); // Estado para los resultados del usuario
  const [loading, setLoading] = useState(true); // Para saber si los datos están cargando

  useEffect(() => {
    const user = auth.currentUser; // Obtener el usuario autenticado

    if (user) {
      const userId = user.uid;
      console.log("User ID:", userId); // Verificar el userId

      // Función para obtener los cursos del usuario desde Firestore
      const fetchUserCourses = async () => {
        try {
          // Consulta general para obtener todos los cursos
          const q = query(collection(db, "courses"));
          const querySnapshot = await getDocs(q);
          const availableCourses = [];

          querySnapshot.forEach((doc) => {
            const courseData = doc.data();
            // Verificar si el ID del usuario está en el campo "users" del curso
            if (courseData.users && courseData.users.includes(userId)) {
              availableCourses.push(courseData); // Agregar el curso si el usuario está en la lista
            }
          });

          console.log("Available Courses for User:", availableCourses); // Verificar los cursos filtrados
          setUserCourses(availableCourses); // Establecer los cursos encontrados en el estado
        } catch (error) {
          console.error("Error fetching user courses: ", error);
        } finally {
          setLoading(false); // Terminar el loading cuando los datos se han obtenido
        }
      };

      // Función para obtener los resultados del usuario desde Realtime Database
      const fetchUserResults = async () => {
        try {
          const userResultsRef = ref(rtdb, 'results/' + userId); // Referencia a los resultados del usuario
          const snapshot = await get(userResultsRef); // Obtener los datos de Firebase
          if (snapshot.exists()) {
            const resultsData = snapshot.val();
            setUserResults(resultsData); // Guardar los resultados en el estado
          } else {
            console.log("No results found for user.");
          }
        } catch (error) {
          console.error("Error fetching user results: ", error);
        }
      };

      // Obtener cursos y resultados
      fetchUserCourses();
      fetchUserResults();
    }
  }, []); // Solo se ejecuta cuando el componente se monta

  // Si no hay usuario autenticado o estamos cargando, mostramos un mensaje
  if (loading) return <p>Loading...</p>;
  if (!auth.currentUser) return <p>Please log in to view courses.</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>FLUENT HUB
      </h2>
      <div style={styles.scrollContainer}>
        <div style={styles.grid}>
          {userCourses.length > 0 ? (
            userCourses.map((course, index) => (
              <div key={index} style={styles.card}>
                <img
                  src={course.image}
                  alt={course.title}
                  style={styles.image}
                />
                <div style={styles.iconContainer}>
                  <GraduationCap size={24} color="#4A90E2" />
                </div>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.level}>
                  <strong>Description:</strong> {course.description}
                </p>
                <p style={styles.level}><strong>Level:</strong> {course.level}</p>
                <p style={styles.mentor}>
                  <User size={16} color="#000" /> {course.mentor}
                </p>

                {/* Mostrar los resultados debajo del curso */}
                {userResults && userResults[course.id] && (
                  <div style={styles.resultsContainer}>
                    <h4>Results:</h4>
                    <p><strong>Total Points:</strong> {userResults[course.id].totalPoints}</p>
                    <p><strong>Correct Answers:</strong> {userResults[course.id].correctAnswers}</p>
                    <p><strong>Incorrect Answers:</strong> {userResults[course.id].incorrectAnswers}</p>
                  </div>
                )}
                
                <div className="btn-go-course">
                <a href={course.link} style={styles.button}>
Go to course
</a>
                </div>
              </div>
            ))
          ) : (
            <p>No courses available for this user.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "10px",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "5px",
  },
  scrollContainer: {
    overflowX: "auto",
    whiteSpace: "nowrap",
    paddingBottom: "10px",
  },
  grid: {
    display: "flex",
    gap: "15px",
  },
  card: {
    minWidth: "250px",
    background: "#fff",
    padding: "15px",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
    display: "inline-block",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },
  courseTitle: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  level: {
    fontSize: "14px",
    color: "#555",
    margin: "5px 0",
  },
  mentor: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    color: "#777",
  },
  resultsContainer: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  button: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s",
  },
};

export default Courses;

import React, { useState } from "react";
import { auth, database } from "../../../firebase-config";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js"; // Importamos las funciones necesarias
import { useNavigate } from "react-router-dom";
import "./Login.css";

const errorMessages = {
  "auth/email-already-in-use": "El correo electrónico ya está en uso.",
  "auth/invalid-email": "El correo electrónico no es válido.",
  "auth/user-not-found": "Usuario no encontrado",
  "auth/weak-password": "La contraseña es demasiado débil.",
  "auth/wrong-password": "La contraseña es incorrecta.",
  "auth/invalid-password": "La contraseña es incorrecta",
  "auth/too-many-requests": "Demasiados intentos, vuelve más tarde",
  "auth/popup-closed-by-user": "Cerraste la pestaña de inicio de sesión.",
  "auth/unauthorized-domain": "Dominio no autorizado",
  "auth/user-cancelled": "Cancelaste el inicio de sesión",
  "auth/cancelled-popup-request": "No tienes internet, revisa.",
  "auth/network-request-failed": "No hay conexión internet",
  default: "Algo anda mal con los datos o con el servidor, refresca la página",
};

function Login() {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      console.log("Usuario autenticado:", user);
  
      const userRef = ref(database, `users-google-auth/${user.uid}`);
  
      await set(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }).then(() => {
        console.log("✅ Usuario guardado correctamente en Realtime Database.");
      }).catch((error) => {
        console.error("❌ Error al guardar en Firebase Database:", error);
      });
  
      navigate("/Dashboard");
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
      const errorCode = error.code;
      setNotification(errorMessages[errorCode] || errorMessages.default);
      setTimeout(() => setNotification(null), 5000);
    }
  };
  
  

  return (
    <section className="inicio-container">
      <div className="content">
        {notification && (
          <div className="notification-bar">
            <p>{notification}</p>
          </div>
        )}
        <h1>¡Bienvenido a Save Planner!</h1>
        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="google-logo"
          />
          Iniciar Sesión con Google
        </button>
        <p className="text">Mantenga sus datos respaldados y sincronizados con su cuenta de Google.</p>
      </div>
    </section>
  );
}

export default Login;

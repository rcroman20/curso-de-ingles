import React from "react";
import { Home, BookOpen, PenTool, Settings, LogOut, School } from "lucide-react";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js"; // Importa Firebase Authentication
import { useNavigate } from "react-router-dom"; // Para redirigir después de hacer logout
import "./Navbar.css";
import '../../../../firebase-config'

const Navbar = () => {
  const navigate = useNavigate(); // Usamos el hook para navegar después de hacer logout

  // Función para hacer logout
  const handleLogout = () => {
    const auth = getAuth(); // Obtén la instancia de auth de Firebase

    signOut(auth) // Realiza el cierre de sesión
      .then(() => {
        console.log("Logout successful");
        navigate("/"); // Redirige a la página principal después de hacer logout
      })
      .catch((error) => {
        console.error("Error signing out: ", error.message);
      });
  };

  return (
    <section className="navbar-sec"> 
      <div className="navbar-top">
        <div className="navbar-logo">
          <School size={20} color="blue" /> Our Academy
        </div>
        <nav>
          <a href="/" className="navbar-link active">
            <Home size={20} /> Home
          </a>

          <a href="/Forum" className="navbar-link">
            <BookOpen size={20} /> Forum
          </a>

          <a href="#" className="navbar-link">
    <PenTool size={20} /> Blog
  </a>
        </nav>
      </div>
      <div className="navbar-bottom">
        <a href="#" className="navbar-link">
          <Settings size={20} /> Settings
        </a>
        {/* Aquí está el botón de logout */}
        <a href="#" className="navbar-link logout" onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </a>
      </div>
    </section>
  );
};

export default Navbar;

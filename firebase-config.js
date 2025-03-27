import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy  } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js';
import { getDatabase, ref, onValue, set, push, remove } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js';



// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBA73ZhHISinShoOZkuAntL1eZ2aU8tcYU",
  authDomain: "projects-2025.firebaseapp.com",
  databaseURL: "https://projects-2025-default-rtdb.firebaseio.com",
  projectId: "projects-2025",
  storageBucket: "projects-2025.appspot.com", // Corrección aquí
  messagingSenderId: "481483812804",
  appId: "1:481483812804:web:7301352cd60d773b1e7e91",
  measurementId: "G-WXMHEGV7MR"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener referencias de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { signInWithPopup ,auth, onAuthStateChanged, signOut, app, db, database, ref, onValue, set, remove, push, collection, addDoc, onSnapshot,  query, orderBy,  };
export { firebaseConfig };


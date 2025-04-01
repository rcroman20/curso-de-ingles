import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy  } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js';
import { getDatabase, ref, onValue, set, push, remove } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js';



// Configuración de Firebase
const firebaseConfig = {

};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener referencias de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { signInWithPopup ,auth, onAuthStateChanged, signOut, app, db, database, ref, onValue, set, remove, push, collection, addDoc, onSnapshot,  query, orderBy,  };
export { firebaseConfig };


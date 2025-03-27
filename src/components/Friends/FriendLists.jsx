import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { User, Plus } from "lucide-react";
import "./FriendLists.css"; // Importa el archivo CSS

const FriendLists = ({ currentUserUid }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!currentUserUid) {
      console.warn("⚠ No hay un usuario autenticado.");
      return;
    }

    console.log("📥 Cargando usuarios desde la base de datos...");
    const db = getDatabase();
    const dbRef = ref(db, "users-google-auth");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("✅ Usuarios obtenidos:", data);

        const usersList = Object.entries(data)
          .filter(([uid, user]) => 
            uid !== currentUserUid && 
            !(user.followers && user.followers[currentUserUid]) // 🔹 Filtrar usuarios ya seguidos
          )
          .map(([uid, user]) => ({
            ...user,
            uid,
            isFollowing: false,
          }));

        setUsers(usersList);
      } else {
        console.log("❌ No hay usuarios registrados.");
        setUsers([]);
      }
    });

    return () => unsubscribe(); // Limpiar la suscripción cuando el componente se desmonta
  }, [currentUserUid]);

  const handleFollow = (followedUid) => {
    if (!currentUserUid) {
      console.error("❌ No se puede seguir, usuario no autenticado.");
      return;
    }

    console.log(`🔹 Intentando seguir a: ${followedUid}`);

    const db = getDatabase();
    const userRef = ref(db, `users-google-auth/${followedUid}/followers`);

    update(userRef, { [currentUserUid]: true })
      .then(() => {
        console.log(`✅ ${currentUserUid} ahora sigue a ${followedUid}`);

        // 🔄 Remover de la lista sin esperar a la recarga
        setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== followedUid));

        console.log(`🗑 ${followedUid} eliminado de la lista de sugerencias.`);
      })
      .catch((error) => {
        console.error("❌ Error al seguir al usuario:", error);
      });
  };

  return (
    <div className="friend-list-container">
      <h2 className="friend-list-title">Sugerencias para ti</h2>
      <ul className="friend-list">
        {users.map((user) => (
          <li key={user.uid} className="friend-item">
            <div className="friend-info">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="friend-avatar" />
              ) : (
                <User className="friend-avatar" />
              )}
              <div className="friend-details">
                <p className="friend-name">{user.name}</p>
                <p className="friend-email">{user.email}</p>
              </div>
            </div>
            <button className="follow-button" onClick={() => handleFollow(user.uid)}>
              <Plus size={16} />
              Seguir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendLists;

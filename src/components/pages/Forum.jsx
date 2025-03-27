import { useState, useEffect } from "react";
import { database, ref, push, onValue, auth } from "../../../firebase-config";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { remove } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import Navbar from "../BasicComponents/Navbar/Navbar";
import Sidebar from "../BasicComponents/Sidebar/Sidebar";
import { Trash } from "lucide-react";

import "./Forum.css";

const Forum = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [posts, setPosts] = useState({});
  const [reply, setReply] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const messagesRef = ref(database, "forum/questions");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      setPosts(data || {});
    });
  }, []);

  const deletePost = (postId) => {
    const postRef = ref(database, `forum/questions/${postId}`);
    remove(postRef)
      .then(() => {
        console.log(`Post ${postId} eliminado`);
      })
      .catch((error) => {
        console.error("Error al eliminar el post:", error);
      });
  };
  

  const sendMessage = () => {
    if (message.trim() !== "" && user && tags.length >= 1) {
      const messagesRef = ref(database, "forum/questions");
      push(messagesRef, {
        text: message,
        user: user.displayName || "Anónimo",
        userPhoto: user.photoURL || "default-avatar.png",
        uid: user.uid, // Almacena el UID del usuario
        timestamp: Date.now(),
        replies: {},
        tags,
      });
      setMessage("");
      setTags([]);
      setTagInput("");
    }
  };
  

  const sendReply = (postId) => {
    if (reply[postId]?.trim() !== "" && user) {
      const repliesRef = ref(database, `forum/questions/${postId}/replies`);
      push(repliesRef, {
        text: reply[postId],
        user: user.displayName || "Anónimo",
        userPhoto: user.photoURL || "default-avatar.png",
        timestamp: Date.now(),
      });
      setReply((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() !== "" && tags.length < 3) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <Navbar />
      </nav>
      <main className="main">
        <div className="p-4">
          <h2 className="text-xl font-bold ">Foro de la Comunidad</h2>

          {user ? (
            <div className="mb-4">
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Escribe tu mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="mt-2 flex">
                <input
                  type="text"
                  className="p-2 border rounded w-full"
                  placeholder="Agrega una etiqueta..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-3 py-1 ml-2 rounded"
                  onClick={addTag}
                  disabled={tags.length >= 3}
                >
                  +
                </button>
              </div>

              <div className="mt-2 flex flex-wrap">
                {tags.map((tag, index) => (
                  <span key={index} className="comment-tag">
                    {tag}
                    <button
                      className="ml-2 text-red-500"
                      onClick={() => removeTag(index)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {tags.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Debes agregar al menos una etiqueta.
                </p>
              )}

              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                onClick={sendMessage}
                disabled={tags.length < 1}
              >
                Enviar
              </button>
            </div>
          ) : (
            <p>Inicia sesión para participar en el foro.</p>
          )}

<div className="mt-4">
  {Object.keys(posts).length > 0 ? (
    Object.entries(posts).map(([postId, post]) => (
      <div key={postId} className="comment-container">
        <img
          className="comment-avatar"
          src={post.userPhoto || "default-avatar.png"}
          alt={post.user}
        />
        <div className="comment-content">
          <p className="comment-user">{post.user}</p>

          {user?.uid === post.uid && (
            <button
              className="text-red-500"
              onClick={() => deletePost(postId)}
            >
              <Trash size={18} />
            </button>
          )}

          <p className="comment-text">{post.text}</p>
          {post.tags && (
            <div className="comment-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="comment-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Sección de respuestas */}
          {post.replies && (
            <div className="replies-container">
              {Object.entries(post.replies).map(([replyId, reply]) => (
                <div key={replyId} className="reply-item">
                  <img
                    className="reply-avatar"
                    src={reply.userPhoto || "default-avatar.png"}
                    alt={reply.user}
                  />
                  <div className="reply-content">
                    <p className="reply-user">{reply.user}</p>
                    <p className="reply-text">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Área para responder */}
          {user && (
            <div className="reply-form">
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Escribe tu respuesta..."
                value={reply[postId] || ""}
                onChange={(e) =>
                  setReply((prev) => ({ ...prev, [postId]: e.target.value }))
                }
              />
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                onClick={() => sendReply(postId)}
                disabled={!reply[postId]?.trim()}
              >
                Responder
              </button>
            </div>
          )}
        </div>
      </div>
    ))
  ) : (
    <p>No hay mensajes aún.</p>
  )}
</div>

        </div>{" "}
      </main>

      <aside className="aside">
        <Sidebar />
      </aside>
    </div>
  );
};

export default Forum;

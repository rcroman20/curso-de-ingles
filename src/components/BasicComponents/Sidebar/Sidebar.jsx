import React, { useState, useEffect } from "react";
import { BarChart2, UserPlus, UserMinus } from "lucide-react"; // Importar los íconos
import { auth, onAuthStateChanged, database, db } from "../../../../firebase-config";
import { ref as dbRef, onValue, set } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

import "./Sidebar.css";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [mentors, setMentors] = useState([]);
  const [followedMentors, setFollowedMentors] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const hours = new Date().getHours();
    setGreeting(
      hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening"
    );
  }, []);

  useEffect(() => {
    const teachersRef = dbRef(database, "/teachers");
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mentorsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          followers: data[key].followers || {},
        }));
        setMentors(mentorsArray);
      } else {
        setMentors([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const followedRef = dbRef(database, `/teachers`);
    onValue(followedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let userFollowed = {};
        Object.keys(data).forEach((mentorId) => {
          if (data[mentorId].followers && data[mentorId].followers[user.uid]) {
            userFollowed[mentorId] = true;
          }
        });
        setFollowedMentors(userFollowed);
      }
    });
  }, [user]);

  const toggleFollow = async (mentorId, mentorName) => {
    if (!user) {
      alert("You must be logged in to follow a mentor.");
      return;
    }

    try {
      const mentorRef = dbRef(database, `/teachers/${mentorId}/followers/${user.uid}`);
      const isFollowing = followedMentors[mentorId];
      await set(mentorRef, isFollowing ? null : true);

      await addDoc(collection(db, "activity_logs"), {
        user: user.displayName || "Anonymous",
        mentor: mentorName,
        action: isFollowing ? "unfollowed" : "followed",
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error saving activity log:", error);
      alert("Error saving activity log: " + error.message);
    }
  };

  return (
    <aside className="sidebar-container">
      <div className="user-section">
        <div className="user-avatar">
          {user ? (
            <div>
              <h3 className="statistics">Statistics</h3>
              <img src={user.photoURL} alt="User Avatar" className="avatar-img" />
            </div>
          ) : (
            <div className="default-avatar" />
          )}
        </div>
        <div className="user-info">
          <h2 className="user-greeting">
            {greeting}, {user ? user.displayName : "Guest"} 🔥
          </h2>
          <p className="user-message">Continue learning to achieve your target!</p>
        </div>
      </div>

      <div className="stats-section">
        <h3 className="stats-title">Statistics</h3>
        <div className="stats-content">
          <BarChart2 className="stats-icon" />
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }}></div>
            </div>
            <p className="progress-text">75% of weekly goal</p>
          </div>
        </div>
      </div>

      <div className="mentor-list">
        <h3 className="mentor-title">Your Mentors</h3>
        <ul>
          {mentors.length > 0 ? (
            mentors.map((mentor) => (
              <li key={mentor.id} className="mentor-item">
                <div className="mentor-info">
                  <div className="mentor-avatar">
                    {mentor.photo ? (
                      <img src={mentor.photo} alt={mentor.name} />
                    ) : (
                      <div className="default-mentor-avatar" />
                    )}
                  </div>
                  <div>
                    <p className="mentor-name">{mentor.name}</p>
                    <p className="mentor-role">{mentor.charge}</p>
                    <p className="mentor-followers">
                      Followers: {Object.keys(mentor.followers || {}).length}
                    </p>
                  </div>
                </div>
                <button
                  className={`follow-button ${followedMentors[mentor.id] ? "following" : ""}`}
                  onClick={() => toggleFollow(mentor.id, mentor.name)}
                >
                  {followedMentors[mentor.id] ? (
                    <UserMinus size={14}  className="follow-icon" />
                  ) : (
                    <UserPlus size={14} className="follow-icon" />
                  )}
                </button>
              </li>
            ))
          ) : (
            <li>No mentors available</li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;

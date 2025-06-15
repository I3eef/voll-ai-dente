import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from "./components/Login";
import TrainingDayDetails from "./components/TrainingDayDetails";
import ProfilePage from "./components/ProfilePage";

function App() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(firebaseUser);
          setAuthorized(true);
        } else {
          setUser(firebaseUser);
          setAuthorized(false);
        }
      } else {
        setUser(null);
        setAuthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) return <p className="app-loading-message">Loading application...</p>;

  return (
    <Router>
      <div className="app-container">
        {user && (
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </nav>
        )}
        <main className="main-content">
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                {authorized ? (
                  <Route path="/" element={<TrainingDayDetails date={new Date()} user={user} />} />
                ) : (
                  <Route path="/" element={<p className="access-denied-message">Access denied. You can update your profile.</p>} />
                )}
                <Route path="/profile" element={<ProfilePage />} />
                 {/* Fallback for logged-in users if no other route matches */}
                {!authorized && <Route path="*" element={<Navigate to="/profile" replace />} />}
                {authorized && <Route path="*" element={<Navigate to="/" replace />} />}
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

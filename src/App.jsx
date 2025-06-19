import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from "./components/Login";
import TrainingDayDetails from "./components/TrainingDayDetails";
import ProfilePage from "./components/ProfilePage";
import WorkoutBacklogPage from "./components/WorkoutBacklogPage";
import AppImprovements from "./components/AppImprovements";

function App() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // State for mobile nav

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // setLoading(true); // Moved to ensure it's set before async ops
      try {
        if (firebaseUser) {
          // console.log("onAuthStateChanged: firebaseUser found:", firebaseUser.uid);
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // console.log("onAuthStateChanged: User document exists for", firebaseUser.uid);
            setUser(firebaseUser);
            setAuthorized(true);
          } else {
            // console.log("onAuthStateChanged: User document DOES NOT exist for", firebaseUser.uid);
            setUser(firebaseUser); // Still set user, they are authenticated
            setAuthorized(false); // But not authorized for certain app parts
          }
        } else {
          // console.log("onAuthStateChanged: No firebaseUser (logged out).");
          setUser(null);
          setAuthorized(false);
        }
      } catch (error) {
        console.error("Error during onAuthStateChanged processing:", error);
        // Decide how to handle user state in case of error reading userDoc
        // For now, assume logged out or at least not authorized if userDoc check fails
        setUser(firebaseUser); // Or null if preferred on error
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileNavOpen(false); // Close mobile nav on logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  if (loading) return <p className="app-loading-message">Loading application...</p>;

  return (
    <Router>
      <div className={`app-container ${isMobileNavOpen ? 'mobile-nav-active' : ''}`}>
        {user && (
          <button className="mobile-nav-toggle" onClick={toggleMobileNav}>
            {isMobileNavOpen ? '✕' : '☰'} {/* Hamburger/Close icon */}
          </button>
        )}
        {user && (
          <nav className={`main-nav ${isMobileNavOpen ? 'mobile-nav-open' : ''}`}>
            <Link to="/" onClick={() => setIsMobileNavOpen(false)}>Today</Link>
            <Link to="/workout-backlog" onClick={() => setIsMobileNavOpen(false)}>Workout Backlog</Link>
            <Link to="/app-improvements" onClick={() => setIsMobileNavOpen(false)}>App Improvements</Link>
            <Link to="/profile" onClick={() => setIsMobileNavOpen(false)}>Profile</Link>
            
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
                <Route path="/workout-backlog" element={<WorkoutBacklogPage />} /> {/* Add route for backlog */}
                {
                  // Placeholder for future app improvements page
                  // <Route path="/app-improvements" element={<AppImprovementsPage />} />
                  <Route path="/app-improvements" element={<AppImprovements/>} />
                }
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

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import TrainingDayDetails from "./components/TrainingDayDetails";

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

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login onLogin={setUser} />;
  if (!authorized) return <p>Access denied. You are not an approved user.</p>;

  return <TrainingDayDetails date={new Date()} />;
}

export default App;

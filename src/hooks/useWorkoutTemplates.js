import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export function useBacklogWorkouts() {
  const [backlogWorkouts, setBacklogWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBacklogWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'backlogWorkouts'));
      const workoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBacklogWorkouts(workoutsData);
    } catch (err) {
      console.error("Error fetching backlog workouts: ", err);
      setError('Failed to load backlog workouts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBacklogWorkouts();
  }, [fetchBacklogWorkouts]);

  const addBacklogWorkout = async (workoutData) => {
    if (!auth.currentUser) {
      setError("User not authenticated to add workouts.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      const docRef = await addDoc(collection(db, 'backlogWorkouts'), {
        ...workoutData,
        createdBy: currentUser.displayName || currentUser.email || 'Unknown User',
        createdByUid: currentUser.uid, // Add createdByUid
        createdAt: Timestamp.now(),
        status: 'backlog'
      });
      setBacklogWorkouts(prev => [...prev, { 
        id: docRef.id, 
        ...workoutData, 
        createdBy: currentUser.displayName || currentUser.email || 'Unknown User', 
        createdByUid: currentUser.uid, // Add createdByUid to local state too
        createdAt: Timestamp.now(),
        status: 'backlog'
      }]);
      return docRef.id;
    } catch (err) {
      console.error("Error adding backlog workout: ", err);
      setError('Failed to save backlog workout.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBacklogWorkout = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'backlogWorkouts', id), updatedData);
      setBacklogWorkouts(prev => prev.map(bw => bw.id === id ? { ...bw, ...updatedData } : bw));
      return true;
    } catch (err) {
      console.error("Error updating backlog workout: ", err);
      setError('Failed to update workout.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBacklogWorkout = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'backlogWorkouts', id));
      setBacklogWorkouts(prev => prev.filter(bw => bw.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting backlog workout: ", err);
      setError('Failed to delete workout.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { backlogWorkouts, loading, error, fetchBacklogWorkouts, addBacklogWorkout, updateBacklogWorkout, deleteBacklogWorkout };
}

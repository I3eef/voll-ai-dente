import {useState, useEffect, useCallback} from 'react';
import {collection, addDoc, getDocs, Timestamp, doc, updateDoc, deleteDoc} from 'firebase/firestore';
import {db, auth} from '../firebase';

export function useAppImprovements() {
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImprovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db,'appImprovements'));
      const improvementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImprovements(improvementsData);
    }catch (err) {
      console.error("Error fetching app improvements: ", err);
      setError('Failed to load app improvements.');
    }finally{
      setLoading(false);
    }}, []);
  
    return {
    improvements,
    loading,
    error,
    fetchImprovements}
  };
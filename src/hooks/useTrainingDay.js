import { useEffect, useState, useCallback, useRef } from "react";
import { collection, getDocs, setDoc, doc, Timestamp, addDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Import auth directly

export function normalizeDate(dateInput) {
  const date = dateInput instanceof Date
    ? dateInput
    : dateInput?.toDate?.() ?? new Date(dateInput);
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

export function useTrainingDay(initialDate) {
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [day, setDay] = useState([]);
  const [editData, setEditData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const newItemIdCounterRef = useRef(0);

  const fetchTrainingDays = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const target = normalizeDate(selectedDate);
      const snap = await getDocs(collection(db, "trainingDays"));
      const data = snap.docs
        .map(d => ({id: d.id, ...d.data()}))
        .filter(d => normalizeDate(d.date).getTime() === target.getTime());
      setDay(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load training data …");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchTrainingDays() }, [fetchTrainingDays]);

  useEffect(() => {
    setEditData(day.map(item=> ({
      ...item,
      sections: item.sections ? item.sections.map(sec => ({ ...sec, score: sec.score || "" })) : []
    })));
  }, [day]);

  const saveTrainingDays = async () => {
    setLoading(true); setError(null);
    try {
      for (const item of editData) {
        const raw = item.date instanceof Date
          ? item.date
          : item.date?.toDate?.() ?? new Date(item.date);
        
        if (item.id.startsWith("new-local-")) { // Check for the correct prefix
          const newDocRef = doc(collection(db, "trainingDays"));
          const { id: tempId, ...dataToSave } = item; 
          const finalPayload = { ...dataToSave, date: Timestamp.fromDate(raw), id: newDocRef.id }; 
          await setDoc(newDocRef, finalPayload);
        } else {
          // For existing documents, remove ID from payload before saving
          const { id, ...dataToSave } = item;
          const payload = { ...dataToSave, date: Timestamp.fromDate(raw) }; 
          await setDoc(doc(db, "trainingDays", item.id), payload, { merge: true });
        }
      }
      setEditMode(false);
      await fetchTrainingDays();
    } catch (e) {
      console.error(e);
      setError("Failed to save changes …");
    } finally {
      setLoading(false);
    }
  };

  const addNewTrainingDay = (userProp) => {
    const firebaseAuthCurrentUser = auth.currentUser;

    const counter = newItemIdCounterRef.current;
    newItemIdCounterRef.current += 1;
    const tempId = `new-local-${counter}`;
    
    let createdBy = firebaseAuthCurrentUser?.displayName || 
                    userProp?.displayName || 
                    firebaseAuthCurrentUser?.email || 
                    userProp?.email || 
                    "Unknown User";

    const createdByUid = firebaseAuthCurrentUser?.uid; // Get the UID

    if (!createdByUid) {
      setError("Cannot create a new training day without a user UID.");
      return;
    }

    setEditData(prev => [
      ...prev,
      {
        id: tempId, 
        date: selectedDate, 
        createdBy: createdBy, 
        createdByUid: createdByUid, // Add the UID to the object
        sections: [], 
        notes: ""
      }
    ]);
    setEditMode(true);
  };

  const deleteTrainingDay = async (itemId) => {
    if (!itemId || itemId.startsWith("new-local-")) {
      // If it's a new, unsaved item, just remove it from local state
      setEditData(prev => prev.filter(item => item.id !== itemId));
      // If it was the only item and it's removed, exit edit mode
      if (editData.length === 1 && editData[0].id === itemId) {
        setEditMode(false);
      }
      return;
    }

    if (!window.confirm("Are you sure you want to delete this training day?")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "trainingDays", itemId));
      // Refetch or update local state
      setDay(prev => prev.filter(item => item.id !== itemId));
      setEditData(prev => prev.filter(item => item.id !== itemId));
      if (editData.filter(item => item.id !== itemId).length === 0 && day.filter(item => item.id !== itemId).length === 0) {
        setEditMode(false); // Exit edit mode if no items are left
      }
    } catch (e) {
      console.error("Failed to delete training day: ", e);
      setError("Failed to delete training day.");
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedDate, setSelectedDate,
    day, editData, setEditData,
    editMode, setEditMode,
    loading, error,
    normalizeDate,
    saveTrainingDays,
    addNewTrainingDay,
    deleteTrainingDay
  };
}

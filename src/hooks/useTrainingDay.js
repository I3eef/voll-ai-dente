import { useEffect, useState, useCallback, useRef } from "react"; // Ensure useRef is imported
import { collection, getDocs, setDoc, doc, Timestamp, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

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
  const newItemIdCounterRef = useRef(0); // Correctly initialize the counter ref

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
    setEditData(day.map(item => ({
      ...item,
      sections: item.sections ? [...item.sections] : []
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
          const payload = { ...item, date: Timestamp.fromDate(raw) }; 
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

  const addNewTrainingDay = () => {
    const counter = newItemIdCounterRef.current;
    newItemIdCounterRef.current += 1;
    const tempId = `new-local-${counter}`; // Use the counter for a unique ID

    setEditData(prev => [
      ...prev,
      { id: tempId, date: selectedDate, createdBy: "", sections: [], notes: "" }
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

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, setDoc, doc, Timestamp } from "firebase/firestore";
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
        const payload = { ...item, date: Timestamp.fromDate(raw) };
        if (item.id.startsWith("new-")) {
          // create a new document with a proper firestore-generated ID
          const newDocRef = doc(collection(db, "trainingDays"));
          await setDoc(newDocRef, payload);
        } else {
          // update existing document
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
    const tempId = `new-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    setEditData(prev => [
      ...prev,
      { id: tempId, date: selectedDate, createdBy: "", sections: [], notes: "" }
    ]);
    setEditMode(true);
  };

  return {
    selectedDate,
    setSelectedDate,
    day,
    editData,
    setEditData,
    editMode,
    setEditMode,
    loading,
    error,
    normalizeDate,
    saveTrainingDays,
    addNewTrainingDay
  };
}

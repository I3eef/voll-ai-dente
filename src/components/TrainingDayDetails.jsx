import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, setDoc, doc, Timestamp, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TrainingDay({ date }) {
  const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : new Date());
  const [day, setDay] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to normalize date for comparison
  const normalizeDate = (dateInput) => {
    const date = dateInput instanceof Date ? dateInput : 
                (dateInput && typeof dateInput.toDate === "function" ? 
                  dateInput.toDate() : new Date(dateInput));
    
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  // Function to fetch training days for selected date
  const fetchTrainingDays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = normalizeDate(selectedDate);
      
      const querySnapshot = await getDocs(collection(db, "trainingDays"));
      const data = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(day => {
          const dateObj = normalizeDate(day.date);
          return (
            dateObj.getFullYear() === targetDate.getFullYear() &&
            dateObj.getMonth() === targetDate.getMonth() &&
            dateObj.getDate() === targetDate.getDate()
          );
        });
      
      setDay(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load training data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTrainingDays();
  }, [fetchTrainingDays]);

  useEffect(() => {
    setEditData(day.map(item => ({
      ...item,
      sections: item.sections ? item.sections.map(s => ({ ...s })) : []
    })));
  }, [day]);

  const handleFieldChange = (idx, field, value) => {
    setEditData(prev =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSectionChange = (itemIdx, sectionIdx, field, value) => {
    setEditData(prev =>
      prev.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              sections: item.sections.map((section, sIdx) =>
                sIdx === sectionIdx
                  ? { ...section, [field]: value }
                  : section
              )
            }
          : item
      )
    );
  };

  const handleAddSection = (itemIdx) => {
    setEditData(prev =>
      prev.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              sections: [...item.sections, { title: "", content: "" }]
            }
          : item
      )
    );
  };

  const handleRemoveSection = (itemIdx, sectionIdx) => {
    setEditData(prev =>
      prev.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              sections: item.sections.filter((_, sIdx) => sIdx !== sectionIdx)
            }
          : item
      )
    );
  };

  const handleCreateNew = () => {
    setEditMode(true);
    setEditData([
      ...editData,
      {
        id: `new-${Date.now()}`,
        date: selectedDate,
        createdBy: "",
        sections: [{ title: "", content: "" }],
        notes: ""
      }
    ]);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      for (const item of editData) {
        // Prepare data for Firestore
        const dateObj = item.date instanceof Date ? 
          item.date : 
          (item.date && typeof item.date.toDate === "function" ? 
            item.date.toDate() : new Date(item.date));
        
        const dataToSave = {
          ...item,
          date: Timestamp.fromDate(isNaN(dateObj) ? new Date() : dateObj),
        };
        
        if (item.id.startsWith("new-")) {
          // Add new doc
          await addDoc(collection(db, "trainingDays"), dataToSave);
        } else {
          // Update existing doc
          const docRef = doc(db, "trainingDays", item.id);
          await setDoc(docRef, dataToSave, { merge: true });
        }
      }
      setEditMode(false);
      // Refresh data
      fetchTrainingDays();
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="training-day-container">
      {error && <div className="error-message">{error}</div>}
      
      {/* Top controls */}
      <div className="controls" style={{ marginBottom: "1em", display: "flex", alignItems: "center", gap: "1em" }}>
        <button onClick={handleCreateNew} disabled={loading}>Create New</button>
        <label>
          Select Date:{" "}
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            showPopperArrow={false}
            disabled={loading}
          />
        </label>
        <button onClick={() => setEditMode(e => !e)} disabled={loading}>
          {editMode ? "View" : "Edit"}
        </button>
        {editMode && (
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : day.length === 0 && editData.length === 0 ? (
        <p>No training days for this date.</p>
      ) : (
        <>
          <h2>{editMode ? "Edit" : "View"} Training Day</h2>
          {(editMode ? editData : day).map((item, idx) => (
            <form key={item.id} className="training-day-form">
              <label>
                Date:
                <DatePicker
                  selected={normalizeDate(item.date)}
                  onChange={date => editMode && handleFieldChange(idx, "date", date)}
                  dateFormat="yyyy-MM-dd"
                  readOnly={!editMode}
                  showPopperArrow={false}
                />
              </label>
              
              <label>
                Created By:
                <input
                  type="text"
                  value={item.createdBy || ""}
                  onChange={e => editMode && handleFieldChange(idx, "createdBy", e.target.value)}
                  readOnly={!editMode}
                />
              </label>
              
              <div className="sections-container">
                <label>Sections:</label>
                {item.sections.map((section, sIdx) => (
                  <div key={sIdx} className="section-item" style={{ marginLeft: "1em", marginBottom: "10px" }}>
                    <input
                      type="text"
                      value={section.title || ""}
                      onChange={e => editMode && handleSectionChange(idx, sIdx, "title", e.target.value)}
                      placeholder="Section Title"
                      readOnly={!editMode}
                      style={{ marginBottom: "5px" }}
                    />
                    <textarea
                      value={section.content || ""}
                      onChange={e => editMode && handleSectionChange(idx, sIdx, "content", e.target.value)}
                      placeholder="Section Content"
                      readOnly={!editMode}
                      rows={3}
                      style={{ width: "100%" }}
                    />
                    {editMode && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSection(idx, sIdx)}
                        disabled={item.sections.length <= 1}
                        style={{ marginTop: "5px" }}
                      >
                        Remove Section
                      </button>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button 
                    type="button" 
                    onClick={() => handleAddSection(idx)}
                    style={{ marginTop: "10px" }}
                  >
                    Add Section
                  </button>
                )}
              </div>
              
              <label>
                Notes:
                <textarea
                  value={item.notes || ""}
                  onChange={e => editMode && handleFieldChange(idx, "notes", e.target.value)}
                  readOnly={!editMode}
                  rows={4}
                  style={{ width: "100%" }}
                />
              </label>
            </form>
          ))}
        </>
      )}
    </div>
  );
}

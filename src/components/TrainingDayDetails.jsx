import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTrainingDay } from "../hooks/useTrainingDay";
import TrainingDayForm from "./TrainingDayForm";

export default function TrainingDayDetails({ date, user }) { // Add user to props
  const {
    selectedDate, setSelectedDate,
    day, editData, setEditData,
    editMode, setEditMode,
    loading, error,
    normalizeDate, saveTrainingDays,
    addNewTrainingDay,
    deleteTrainingDay
  } = useTrainingDay(date);

  const onFieldChange = (i, field, val) =>
    setEditData(d => d.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const onSectionChange = (i, s, f, v) =>
    setEditData(d => d.map((it, idx) =>
      idx === i
        ? { ...it, sections: it.sections.map((sec, si) => si === s ? { ...sec, [f]: v } : sec) }
        : it
    ));
  const onAddSection = i =>
    setEditData(d => d.map((it, idx) =>
      idx === i
        ? { ...it, sections: [...it.sections, { title: "WOD", content: "", score: "" }] } // Add score field
        : it
    ));
  const onRemoveSection = (i, s) =>
    setEditData(d => d.map((it, idx) =>
      idx === i
        ? { ...it, sections: it.sections.filter((_, si) => si !== s) }
        : it
    ));

  return (
    <div className="training-day-container">
      {error && <div className="error-message">{error}</div>}
      <div className="controls">
        <button onClick={() => addNewTrainingDay(user.name)} disabled={loading}>Create New</button> {/* Pass user to addNewTrainingDay */}
        <label>
          Date:
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat="yyyy-MM-dd"
            showPopperArrow={false}
            disabled={loading}
          />
        </label>
        <button onClick={() => setEditMode(m => !m)} disabled={loading}>
          {editMode ? "View" : "Edit"}
        </button>
        {editMode && (
          <button onClick={saveTrainingDays} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : day.length === 0 && editData.length === 0 ? (
        <p>No training days for this date.</p>
      ) : (
        <TrainingDayForm
          day={day}
          editData={editData}
          editMode={editMode}
          normalizeDate={normalizeDate}
          onFieldChange={onFieldChange}
          onSectionChange={onSectionChange}
          onAddSection={onAddSection}
          onRemoveSection={onRemoveSection}
          onDeleteTrainingDay={deleteTrainingDay} // Pass deleteTrainingDay
        />
      )}
    </div>
  );
}
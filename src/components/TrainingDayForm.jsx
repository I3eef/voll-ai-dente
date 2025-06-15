import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TrainingDayForm({
  day,
  editData,
  editMode,
  normalizeDate,
  onFieldChange,
  onSectionChange,
  onAddSection,
  onRemoveSection
}) {
  return (
    <>
      {(editMode ? editData : day).map((item, idx) => (
        <form key={item.id} className="training-day-form">
          {/* Date */}
          <label>
            Date:
            <DatePicker
              selected={normalizeDate(item.date)}
              onChange={d => editMode && onFieldChange(idx, "date", d)}
              dateFormat="yyyy-MM-dd"
              readOnly={!editMode}
              showPopperArrow={false}
            />
          </label>
          {/* Created By */}
          <label>
            Created By:
            <input
              type="text"
              value={item.createdBy || ""}
              onChange={e => editMode && onFieldChange(idx, "createdBy", e.target.value)}
              readOnly={!editMode}
            />
          </label>
          {/* Sections */}
          <div className="sections-container">
            <label>Sections:</label>
            {item.sections.map((section, sIdx) => (
              <div key={sIdx} className="section-item">
                <input
                  type="text"
                  value={section.title || ""}
                  onChange={e => editMode && onSectionChange(idx, sIdx, "title", e.target.value)}
                  placeholder="Section Title"
                  readOnly={!editMode}
                />
                <textarea
                  rows={3}
                  value={section.content || ""}
                  onChange={e => editMode && onSectionChange(idx, sIdx, "content", e.target.value)}
                  placeholder="Section Content"
                  readOnly={!editMode}
                />
                {editMode && (
                  <button type="button" onClick={() => onRemoveSection(idx, sIdx)}>
                    Remove Section
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button type="button" onClick={() => onAddSection(idx)}>
                Add Section
              </button>
            )}
          </div>
          {/* Notes */}
          <label>
            Notes:
            <textarea
              rows={4}
              value={item.notes || ""}
              onChange={e => editMode && onFieldChange(idx, "notes", e.target.value)}
              readOnly={!editMode}
            />
          </label>
        </form>
      ))}
    </>
  );
}
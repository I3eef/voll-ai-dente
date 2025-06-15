import React, { useState } from "react";
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
  onRemoveSection,
  onDeleteTrainingDay
}) {
  const [collapsedSections, setCollapsedSections] = useState({});
  const sectionTitleOptions = ["WOD", "Warmup", "Mobility", "Skill", "Gymnastic", "Other"];

  const toggleSectionCollapse = (itemIdx, sectionIdx) => {
    const key = `${itemIdx}-${sectionIdx}`;
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSectionCollapsed = (itemIdx, sectionIdx) => {
    return !!collapsedSections[`${itemIdx}-${sectionIdx}`];
  };

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
              readOnly // Make this field read-only
              // onChange is removed as it's read-only
              style={{ backgroundColor: editMode ? '#e9ecef' : 'transparent' }} // Indicate read-only state
            />
          </label>
          {/* Sections */}
          <div className="sections-container">
            <label>Sections:</label>
            {item.sections.map((section, sIdx) => {
              const sectionKey = `${idx}-${sIdx}`;
              const isCollapsed = isSectionCollapsed(idx, sIdx);
              return (
                <div key={sIdx} className={`section-item ${isCollapsed ? 'collapsed' : ''}`}>
                  <div className="section-header" onClick={() => toggleSectionCollapse(idx, sIdx)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                    {editMode ? (
                      <select
                        value={section.title}
                        onChange={e => {
                          e.stopPropagation();
                          onSectionChange(idx, sIdx, "title", e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking select
                        style={{ flexGrow: 1, marginRight: '10px', fontSize: '1.1rem', padding: '5px' }}
                      >
                        {sectionTitleOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        {!sectionTitleOptions.includes(section.title) && section.title !== "" && (
                           <option key={section.title} value={section.title}>{section.title} (Custom)</option>
                        )}
                         {section.title === "" && (
                           <option key="custom" value="">Select or type...</option>
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={section.title || ""}
                        readOnly
                        style={{ flexGrow: 1, marginRight: '10px', border: 'none', backgroundColor: 'transparent', fontSize: '1.1rem', fontWeight: 'bold' }}
                      />
                    )}
                    <span>{isCollapsed ? '[+]' : '[-]'}</span>
                  </div>
                  {!isCollapsed && (
                    <div className="section-content">
                      <textarea
                        value={section.content || ""}
                        onChange={e => editMode && onSectionChange(idx, sIdx, "content", e.target.value)}
                        placeholder="Section Content"
                        readOnly={!editMode}
                        rows={3}
                      />
                      {editMode && (
                        <input
                          type="text"
                          value={section.score || ""} // Bind to section.score
                          onChange={e => onSectionChange(idx, sIdx, "score", e.target.value)} // Update score
                          placeholder="Score / Result"
                          style={{ marginTop: '10px' }} // Add some spacing
                        />
                      )}
                      {!editMode && section.score && (
                        <div className="section-score-display" style={{ marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #eee'}}>
                          <strong>Score:</strong> {section.score}
                        </div>
                      )}
                      {editMode && (
                        <button type="button" onClick={()=>onRemoveSection(idx,sIdx)}>
                          Remove Section
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {editMode && (
              <button type="button" onClick={()=>onAddSection(idx)}>
                Add Section
              </button>
            )}
          </div>
          {/* Notes */}
          <label>
            Notes:
            <textarea
              value={item.notes || ""}
              onChange={e => editMode && onFieldChange(idx, "notes", e.target.value)}
              readOnly={!editMode}
              rows={4}
            />
          </label>
          {editMode && (
            <button
              type="button"
              onClick={() => onDeleteTrainingDay(item.id)}
              className="delete-item-button"
              style={{ marginTop: '10px', backgroundColor: '#dc3545' }} // Basic styling
            >
              Delete Training Day
            </button>
          )}
        </form>
      ))}
    </>
  );
}
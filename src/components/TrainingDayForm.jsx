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
  onRemoveSection
}) {
  const [collapsedSections, setCollapsedSections] = useState({}); // { "itemIdx-sectionIdx": true/false }

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
              onChange={e => editMode && onFieldChange(idx, "createdBy", e.target.value)}
              readOnly={!editMode}
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
                    <input
                      type="text"
                      value={section.title || ""}
                      onChange={e => {
                        e.stopPropagation(); // Prevent toggle when editing title
                        if (editMode) onSectionChange(idx, sIdx, "title", e.target.value);
                      }}
                      placeholder="Section Title"
                      readOnly={!editMode}
                      onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking input itself
                      style={{ flexGrow: 1, marginRight: '10px' }}
                    />
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
        </form>
      ))}
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { useBacklogWorkouts } from '../hooks/useWorkoutTemplates';

export default function WorkoutBacklogPage() {
  const { 
    backlogWorkouts,
    loading, 
    error, 
    addBacklogWorkout,
    deleteBacklogWorkout,
    updateBacklogWorkout // Added update function
  } = useBacklogWorkouts();
  
  const [isEditing, setIsEditing] = useState(false); // To track if we are editing
  const [currentWorkout, setCurrentWorkout] = useState(null); // To hold the workout being edited

  const [workoutName, setWorkoutName] = useState(''); 
  const [workoutSections, setWorkoutSections] = useState([{ title: 'WOD', content: '', score: '' }]);
  const [message, setMessage] = useState('');

  const sectionTitleOptions = ["WOD", "Warmup", "Mobility", "Skill", "Gymnastic", "Other", "Strenght", "Olympic", "Cardio", "Conditioning", "Accessory", "Core", "Cool Down"];

  // Effect to populate form when currentWorkout changes (for editing)
  useEffect(() => {
    if (isEditing && currentWorkout) {
      setWorkoutName(currentWorkout.name || '');
      setWorkoutSections(currentWorkout.sections && currentWorkout.sections.length > 0 
        ? JSON.parse(JSON.stringify(currentWorkout.sections)) // Deep copy
        : [{ title: 'WOD', content: '', score: '' }]);
    } else {
      // Reset form if not editing or no current workout
      setWorkoutName('');
      setWorkoutSections([{ title: 'WOD', content: '', score: '' }]);
    }
  }, [isEditing, currentWorkout]);

  const handleAddSection = () => {
    setWorkoutSections([...workoutSections, { title: 'WOD', content: '', score: '' }]);
  };

  const handleRemoveSection = (index) => {
    const sections = [...workoutSections];
    sections.splice(index, 1);
    setWorkoutSections(sections);
  };

  const handleSectionChange = (index, field, value) => {
    const sections = [...workoutSections];
    sections[index][field] = value;
    setWorkoutSections(sections);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentWorkout(null);
    // setWorkoutName(''); // useEffect will handle this
    // setWorkoutSections([{ title: 'WOD', content: '', score: '' }]); // useEffect will handle this
    setMessage('');
  };

  const handleSubmitOrUpdateWorkout = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!workoutName.trim()) {
      setMessage('Workout name is required.');
      return;
    }
    if (workoutSections.length === 0 || workoutSections.some(s => !s.title)) {
      setMessage('At least one section with a title is required.');
      return;
    }

    const workoutData = {
      name: workoutName,
      sections: workoutSections,
    };

    let success;
    if (isEditing && currentWorkout) {
      success = await updateBacklogWorkout(currentWorkout.id, workoutData);
      if (success) {
        setMessage('Workout updated successfully!');
        resetForm();
      } else {
        setMessage('Failed to update workout. Check console for errors.');
      }
    } else {
      const newId = await addBacklogWorkout(workoutData);
      if (newId) {
        setMessage('Workout saved to backlog successfully!');
        resetForm(); // Resets form fields via useEffect
      } else {
        setMessage('Failed to save workout. Check console for errors.');
      }
    }
  };

  const handleEdit = (workout) => {
    setIsEditing(true);
    setCurrentWorkout(workout);
    setMessage('Editing workout. Scroll to form.'); // Inform user
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top where form is
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this backlog workout?")) {
      const success = await deleteBacklogWorkout(id);
      if (success) {
        setMessage("Workout deleted from backlog.");
      } else {
        setMessage("Failed to delete workout. Check console for errors.");
      }
    }
  };

  const handleSchedule = (id) => {
    // Placeholder for scheduling logic
    // This might involve navigating to the main TrainingDayDetails page with pre-filled data
    // or updating the workout's status and adding a date.
    console.log("Schedule workout ID:", id);
    setMessage(`Placeholder: Schedule workout ${id}. Implement scheduling logic.`);
    // Example: navigate(`/schedule/${id}`) or open a modal
  };

  return (
    <div className="workout-backlog-container">
      <h2>Workout Backlog</h2>
      {message && <p className={`message ${error || message.startsWith('Failed') ? 'error-message' : 'success-message'}`}>{message}</p>}
      {error && <p className="error-message">Hook Error: {error}</p>}

      <form onSubmit={handleSubmitOrUpdateWorkout} className="backlog-form">
        <h3>{isEditing ? 'Edit Workout in Backlog' : 'Add New Workout to Backlog'}</h3>
        <div className="form-group">
          <label htmlFor="workoutName">Workout Name:</label>
          <input
            type="text"
            id="workoutName"
            value={workoutName} // Controlled component
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Monday Strength, Hero WOD Annie"
            required
          />
        </div>

        <h4>Sections:</h4>
        {workoutSections.map((section, index) => (
          <div key={index} className="backlog-section-item">
            <div className="section-header">
              <select 
                value={section.title} 
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                className="section-title-select"
              >
                {sectionTitleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                {/* Allow custom titles already in data or newly typed */}
                {!sectionTitleOptions.includes(section.title) && section.title && (
                    <option key={section.title} value={section.title}>{section.title} (Custom)</option>
                )}
                 {section.title === "" && (
                    <option key="custom" value="">Select or type...</option> 
                 )}
              </select>
              <button type="button" onClick={() => handleRemoveSection(index)} className="remove-section-button-small">
                🗑️ Remove
              </button>
            </div>
            <textarea
              value={section.content} // Controlled component
              onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
              placeholder="Section details (movements, reps, etc.)"
              rows={3}
            />
            <input
              type="text"
              value={section.score} // Controlled component
              onChange={(e) => handleSectionChange(index, 'score', e.target.value)}
              placeholder="Scoring type or notes (e.g., For Time, AMRAP, Max Load)"
            />
          </div>
        ))}
        <button type="button" onClick={handleAddSection} className="add-section-button">
          + Add Section
        </button>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="save-backlog-button">
            {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Workout' : 'Save Workout to Backlog')}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="cancel-edit-button">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="existing-backlog-list">
        <h3>Existing Backlog Workouts</h3>
        {loading && backlogWorkouts.length === 0 && <p>Loading workouts...</p>}
        {!loading && backlogWorkouts.length === 0 && <p>No workouts in the backlog yet.</p>}
        {backlogWorkouts.map(workout => (
          <div key={workout.id} className="backlog-card">
            <h4>{workout.name}</h4>
            <div className="backlog-card-details">
              {workout.sections && workout.sections.map((section, sIdx) => (
                <div key={sIdx} className="backlog-card-section">
                  <strong>{section.title || 'Section'}:</strong>
                  <p className="section-content-display">{section.content || 'N/A'}</p>
                  {section.score && <p className="section-score-display"><em>Score/Notes:</em> {section.score}</p>}
                </div>
              ))}
            </div>
            <p className="workout-meta">Status: {workout.status || 'backlog'}</p>
            <p className="workout-meta">Created by: {workout.createdBy} on {workout.createdAt?.toDate?.().toLocaleDateString()}</p>
            <div className="backlog-card-actions">
              <button onClick={() => handleEdit(workout)} className="edit-button">✏️ Edit</button>
              <button onClick={() => handleSchedule(workout.id)} className="schedule-button">🗓️ Schedule</button>
              <button onClick={() => handleDelete(workout.id)} className="delete-button-small">🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

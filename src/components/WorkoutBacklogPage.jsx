import React, { useState } from 'react';
import { useBacklogWorkouts } from '../hooks/useWorkoutTemplates'; // Corrected import path

export default function WorkoutBacklogPage() {
  const { 
    backlogWorkouts, // Renamed from templates
    loading, 
    error, 
    addBacklogWorkout, // Renamed from addWorkoutTemplate
    deleteBacklogWorkout, // Added delete function
    // updateBacklogWorkout // Available if needed for scheduling
  } = useBacklogWorkouts();
  
  const [newWorkoutName, setNewWorkoutName] = useState(''); // Renamed
  const [newWorkoutSections, setNewWorkoutSections] = useState([{ title: 'WOD', content: '', score: '' }]); // Renamed
  const [message, setMessage] = useState('');

  const sectionTitleOptions = ["WOD", "Warmup", "Mobility", "Skill", "Gymnastic", "Other"];

  const handleAddSection = () => {
    setNewWorkoutSections([...newWorkoutSections, { title: 'WOD', content: '', score: '' }]);
  };

  const handleRemoveSection = (index) => {
    const sections = [...newWorkoutSections];
    sections.splice(index, 1);
    setNewWorkoutSections(sections);
  };

  const handleSectionChange = (index, field, value) => {
    const sections = [...newWorkoutSections];
    sections[index][field] = value;
    setNewWorkoutSections(sections);
  };

  const handleSubmitWorkout = async (e) => { // Renamed
    e.preventDefault();
    setMessage('');
    if (!newWorkoutName.trim()) {
      setMessage('Workout name is required.');
      return;
    }
    if (newWorkoutSections.length === 0) {
      setMessage('At least one section is required.');
      return;
    }

    const workoutData = {
      name: newWorkoutName,
      sections: newWorkoutSections,
      // status: 'backlog' is set by the hook
    };
    const newId = await addBacklogWorkout(workoutData);
    if (newId) {
      setNewWorkoutName('');
      setNewWorkoutSections([{ title: 'WOD', content: '', score: '' }]);
      setMessage('Workout saved to backlog successfully!');
    } else {
      setMessage('Failed to save workout. Check console for errors.');
    }
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

      <form onSubmit={handleSubmitWorkout} className="backlog-form"> {/* Renamed class */}
        <h3>Add New Workout to Backlog</h3>
        <div className="form-group">
          <label htmlFor="workoutName">Workout Name:</label> {/* Renamed label */}
          <input
            type="text"
            id="workoutName" // Renamed id
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
            placeholder="e.g., Monday Strength, Hero WOD Annie"
            required
          />
        </div>

        <h4>Sections:</h4>
        {newWorkoutSections.map((section, index) => (
          <div key={index} className="backlog-section-item"> {/* Renamed class */}
            <div className="section-header">
              <select 
                value={section.title} 
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                className="section-title-select"
              >
                {sectionTitleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                {!sectionTitleOptions.includes(section.title) && section.title !== '' && (
                    <option key={section.title} value={section.title}>{section.title} (Custom)</option>
                )}
              </select>
              <button type="button" onClick={() => handleRemoveSection(index)} className="remove-section-button-small">
                🗑️ Remove
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
              placeholder="Section details (movements, reps, etc.)"
              rows={3}
            />
            <input
              type="text"
              value={section.score}
              onChange={(e) => handleSectionChange(index, 'score', e.target.value)}
              placeholder="Scoring type or notes (e.g., For Time, AMRAP, Max Load)"
            />
          </div>
        ))}
        <button type="button" onClick={handleAddSection} className="add-section-button">
          + Add Section
        </button>
        <button type="submit" disabled={loading} className="save-backlog-button"> {/* Renamed class */}
          {loading ? 'Saving Workout...' : 'Save Workout to Backlog'}
        </button>
      </form>

      <div className="existing-backlog-list"> {/* Renamed class */}
        <h3>Existing Backlog Workouts</h3>
        {loading && backlogWorkouts.length === 0 && <p>Loading workouts...</p>}
        {!loading && backlogWorkouts.length === 0 && <p>No workouts in the backlog yet.</p>}
        {backlogWorkouts.map(workout => (
          <div key={workout.id} className="backlog-card"> {/* Renamed class */}
            <h4>{workout.name}</h4>
            <p>Status: {workout.status || 'backlog'}</p>
            <p>Created by: {workout.createdBy} on {workout.createdAt?.toDate?.().toLocaleDateString()}</p>
            <div className="backlog-card-actions">
              <button onClick={() => handleSchedule(workout.id)} className="schedule-button">🗓️ Schedule</button>
              <button onClick={() => handleDelete(workout.id)} className="delete-button-small">🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

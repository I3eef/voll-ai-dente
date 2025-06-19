import { useEffect } from "react";
import { useAppImprovements } from "../hooks/useAppImprovements";

export default function AppImprovements() {
  const { improvements, loading, error, fetchImprovements } = useAppImprovements();

  useEffect(() => {
    fetchImprovements();
  }, [fetchImprovements]);

  return (
  
    <div className="app-improvement-container">
      <h2>App Improvements</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-message">Loading improvements...</div>
      ) : (
        <ul className="improvement-list">
          {improvements.map((imp, index) => (
            <li key={imp.priority} className="improvement-item">
              <h3>{imp.description} (Priority:{imp.priority})</h3>
              </li>
          ))}
        </ul>
      )}
      {!loading && improvements.length === 0 && (
        <div className="no-improvements-message">No improvements found.</div>
      )}
    </div>
  
  );
}
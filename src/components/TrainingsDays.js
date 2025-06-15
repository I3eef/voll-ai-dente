// src/components/TrainingDays.js
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function TrainingDays() {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "trainingDays"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDays(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Training Days</h2>
      <ul>
        {days.map(day => (
          <li key={day.id}>
            <strong>{day.date}</strong>
            <ul>
              {day.sections?.map((section, index) => (
                <li key={index}>
                  <em>{section.title}</em>: {section.content}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

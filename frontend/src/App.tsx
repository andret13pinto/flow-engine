import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import UpdateFlowPage from "./pages/UpdateFlowPage";
import { Flow } from "./types";

const App: React.FC = () => {
  const [flows, setFlows] = useState<Flow[] | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch(`${apiUrl}/flows`);
        if (!response.ok) {
          throw new Error("Failed to fetch flows");
        }
        const data = await response.json();
        setFlows(data);
      } catch (error) {
        console.error("Error fetching flows:", error);
        setFlows(null);
      }
    };

    fetchFlows();
  }, [apiUrl]);

  const updateFlow = async (updatedFlow: Flow) => {
    try {
      const response = await fetch(`${apiUrl}/flows/${updatedFlow.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFlow),
      });

      if (!response.ok) {
        throw new Error("Failed to update flow");
      }

      setFlows((prev) =>
        prev
          ? prev.map((f) => (f.id === updatedFlow.id ? updatedFlow : f))
          : null,
      );
    } catch (error) {
      console.error("Error updating flow:", error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainPage flows={flows} setFlows={setFlows} apiUrl={apiUrl} />
          }
        />
        <Route
          path="/update/:id"
          element={<UpdateFlowPage flows={flows} onUpdateFlow={updateFlow} />}
        />
      </Routes>
    </Router>
  );
};

export default App;

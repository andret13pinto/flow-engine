import React, { useState, useEffect } from "react";
import FlowsList from "../components/FlowsList";
import CreateOrImportFlow from "../components/CreateOrImportFlow"; // <-- NEW
import { Flow, FlowState } from "../types";

interface MainPageProps {
  flows: Flow[] | null;
  setFlows: React.Dispatch<React.SetStateAction<Flow[] | null>>;
  apiUrl: string;
}

const MainPage: React.FC<MainPageProps> = ({ flows, setFlows, apiUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch flows on mount
  useEffect(() => {
    const fetchFlows = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/flows`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch flows: ${response.status} - ${
              errorData?.message || response.statusText
            }`,
          );
        }

        const data: Flow[] = await response.json();
        setFlows(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlows();
  }, [apiUrl]);

  // When the user creates a new flow via the "CreateFlowPanel" inside CreateOrImportFlow
  const handleFlowCreated = (newFlow: Flow) => {
    console.log("New flow created:", newFlow.name);
    setFlows((prev) => (prev ? [...prev, newFlow] : [newFlow]));
  };

  // When the user imports a flow (single flow) via the "Import Flow"
  const handleFlowImported = (importedFlow: Flow) => {
    setFlows((prev) => (prev ? [...prev, importedFlow] : [importedFlow]));
  };

  // Delete flow
  const deleteFlow = async (flowId: string) => {
    try {
      const response = await fetch(`${apiUrl}/flows/${flowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to delete flow: ${response.status} - ${
            errorData?.message || response.statusText
          }`,
        );
      }

      setFlows((prev) =>
        prev ? prev.filter((flow) => flow.id !== flowId) : null,
      );
    } catch (err) {
      console.error("Error deleting flow:", err);
    }
  };

  // Run flow
  const runFlow = async (flowId: string) => {
    try {
      // Set state to "IN_PROGRESS"
      setFlows(
        (prev) =>
          prev?.map((flow) =>
            flow.id === flowId
              ? { ...flow, state: FlowState.IN_PROGRESS }
              : flow,
          ),
      );

      // Execute flow
      const response = await fetch(`${apiUrl}/flows/${flowId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to execute flow");
      }

      const result = await response.json();
      console.log("Flow executed successfully:", result);

      // Set state to "COMPLETED_SUCESSFULLY"
      setFlows(
        (prev) =>
          prev?.map((flow) =>
            flow.id === flowId
              ? { ...flow, state: FlowState.COMPLETED_SUCESSFULLY }
              : flow,
          ),
      );
    } catch (err) {
      console.error("Error running flow:", err);
      setFlows(
        (prev) =>
          prev?.map((flow) =>
            flow.id === flowId
              ? { ...flow, state: FlowState.COMPLETED_WITH_ERRORS }
              : flow,
          ),
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">Flow Manager</h1>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 text-white py-10 px-4 text-center">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to Your Flow Management Dashboard
          </h2>
          <p className="text-gray-100 text-sm md:text-base max-w-2xl mx-auto">
            Create, import, and manage your flows with a sleek, modern design.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="-mt-8 pb-12 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[600px_1fr] gap-8">
              {/* LEFT: CreateOrImportFlow */}
              <div>
                <CreateOrImportFlow
                  onFlowCreated={handleFlowCreated}
                  onFlowImported={handleFlowImported}
                  apiUrl={apiUrl}
                />
              </div>

              {/* RIGHT: Flows List */}
              <div>
                <FlowsList
                  flows={flows}
                  isLoading={isLoading}
                  error={error}
                  onRunFlow={runFlow}
                  onDeleteFlow={deleteFlow}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-200 text-gray-600 py-4 mt-auto text-center text-sm">
        © {new Date().getFullYear()} Flow Manager.
      </footer>
    </div>
  );
};

export default MainPage;

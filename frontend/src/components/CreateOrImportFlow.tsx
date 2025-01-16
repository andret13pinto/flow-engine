import React, { useState } from "react";
import { ArrowUpOnSquareIcon, PlusIcon } from "@heroicons/react/24/solid";
import CreateFlowPanel from "./CreateFlowPanel";
import { generateId, assignIdsToNodes } from "../flowUtils";
import { NodeTypeNames, NodeType } from "../types";

interface CreateOrImportFlowProps {
  onFlowCreated: (flow: any) => void; // adapt the type to your Flow model
  onFlowImported: (flow: any) => void; // we pass back the created flow from the server
  apiUrl: string;
}

const CreateOrImportFlow: React.FC<CreateOrImportFlowProps> = ({
  onFlowCreated,
  onFlowImported,
  apiUrl,
}) => {
  const [currentMode, setCurrentMode] = useState<"NONE" | "CREATE" | "IMPORT">(
    "NONE",
  );

  // Handle a single JSON flow import
  const handleImportFlow = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log("handleImportFlow triggered");

    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Create a reverse mapping from names to NodeType enum values
    const nameToTypeMap: Record<string, NodeType> = Object.entries(
      NodeTypeNames,
    ).reduce(
      (map, [key, value]) => {
        map[value] = Number(key) as NodeType;
        return map;
      },
      {} as Record<string, NodeType>,
    );

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      // Convert Node Type
      const normalizedData = {
        name: importedData.Name,
        nodes: importedData.Nodes.map((node: any) => {
          const mappedType = nameToTypeMap[node.Type];
          if (!mappedType) {
            throw new Error(`Unknown node type: ${node.Type}`);
          }
          return {
            type: mappedType,
            config: node.Config,
          };
        }),
      };
      console.log("Imported JSON data is:", importedData);

      const payload = {
        id: generateId(),
        name: importedData.Name,
        nodes: assignIdsToNodes(normalizedData.nodes),
      };

      console.log("Sending payload to server:", JSON.stringify(payload));

      // Send POST request to create the flow on the backend
      const response = await fetch(`${apiUrl}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to import flow: ${response.status}`);
      }

      // Get the newly created flow from the server
      const createdFlow = await response.json();

      // Call parent callback with the single created flow
      onFlowImported(createdFlow);

      alert(`Imported flow "${createdFlow.name}" successfully!`);
    } catch (err) {
      console.error("Error importing flow:", err);
      alert(
        "Failed to import flow. Please ensure the JSON file is correctly formatted.",
      );
    } finally {
      // Reset input so user can re-import the same file if needed
      event.target.value = "";
      setCurrentMode("NONE");
    }
  };

  // Renders the UI based on current mode
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md space-y-4">
      {/* Step 1: Prompt user with two options */}
      {currentMode === "NONE" && (
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <button
            onClick={() => setCurrentMode("CREATE")}
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Flow
          </button>
          <button
            onClick={() => {
              console.log("Setting currentMode to IMPORT");
              setCurrentMode("IMPORT");
            }}
            className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
            Import Flow
          </button>
        </div>
      )}

      {/* Step 2A: CREATE Flow Panel */}
      {currentMode === "CREATE" && (
        <div>
          <button
            onClick={() => setCurrentMode("NONE")}
            className="text-sm text-gray-500 mb-4 underline"
          >
            ← Back
          </button>

          <CreateFlowPanel
            onFlowCreated={(newFlow) => {
              console.log("Flow created in CreateFlowPanel:", newFlow);
              onFlowCreated(newFlow);
              setCurrentMode("NONE");
            }}
            apiUrl={apiUrl}
          />
        </div>
      )}

      {/* Step 2B: IMPORT Flow UI */}
      {currentMode === "IMPORT" && (
        <div className="space-y-4">
          <button
            onClick={() => setCurrentMode("NONE")}
            className="text-sm text-gray-500 mb-2 underline"
          >
            ← Back
          </button>
          <label className="block text-sm font-medium text-gray-700">
            Choose JSON file to import:
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFlow}
            className="block w-full text-sm text-gray-800 border border-gray-300 rounded-lg shadow focus:ring-blue-500 focus:border-blue-500 file:bg-gray-200 file:border-0 file:py-2 file:px-4 file:rounded file:text-blue-600 hover:file:bg-gray-300"
          />
        </div>
      )}
    </div>
  );
};

export default CreateOrImportFlow;

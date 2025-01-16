import React from "react";
import { useNavigate } from "react-router-dom";
import { Flow, FlowState, FlowStateNames, NodeTypeNames } from "../types";
import {
  PlayIcon,
  EyeIcon,
  TrashIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";

interface FlowsListProps {
  flows: Flow[] | null;
  isLoading: boolean;
  error: Error | null;
  onRunFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
}

const FlowsList: React.FC<FlowsListProps> = ({
  flows,
  isLoading,
  error,
  onRunFlow,
  onDeleteFlow,
}) => {
  const navigate = useNavigate();

  const onExportFlow = (flow: Flow) => {
    // Convert the flow to a format that can be exported
    const exportableFlow = {
      ...flow,
      nodes: flow.nodes?.map((node) => ({
        ...node,
        type: node.type ? NodeTypeNames[node.type] : "Idle",
      })),
    };

    const fileName = `${exportableFlow.name || "flow"}.json`;
    const json = JSON.stringify(exportableFlow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-600 italic animate-pulse">
        Loading flows...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center border rounded border-gray-200 bg-gray-50 text-gray-600">
        <h3 className="text-xl font-semibold mb-2">Error fetching flows</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-700 mb-4">Flows List</h3>

      {!flows || flows.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No flows available.</p>
      ) : (
        <table className="table-auto w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3">Name</th>
              <th className="border-b border-gray-200 px-4 py-3">State</th>
              <th className="border-b border-gray-200 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((flow) => (
              <tr
                key={flow.id}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <td className="border-b border-gray-200 px-4 py-3">
                  {flow.name}
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {/* Circle indicator */}
                    <span
                      className={`inline-block w-4 h-4 rounded-full ${
                        flow.state === FlowState.COMPLETED_SUCESSFULLY
                          ? "bg-blue-500"
                          : flow.state === FlowState.COMPLETED_WITH_ERRORS
                            ? "bg-gray-600"
                            : flow.state === FlowState.IN_PROGRESS
                              ? "bg-gray-400 animate-pulse"
                              : "bg-gray-300"
                      }`}
                      title={flow.state ? FlowStateNames[flow.state] : "Idle"}
                    />
                    <span className="text-sm text-gray-600">
                      {flow.state ? FlowStateNames[flow.state] : "Not Started"}
                    </span>
                  </div>
                </td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {/* Run Flow (Blue) */}
                    <button
                      onClick={() => onRunFlow(flow.id)}
                      title="Run Flow"
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>

                    {/* View Flow (Gray) */}
                    <button
                      onClick={() => navigate(`/update/${flow.id}`)}
                      title="View Flow Details"
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {/* Delete Flow (Red) */}
                    <button
                      onClick={() =>
                        window.confirm(
                          "Are you sure you want to delete this flow?",
                        ) && onDeleteFlow(flow.id)
                      }
                      title="Delete Flow"
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>

                    {/* Export Flow (Green) */}
                    <button
                      onClick={() => onExportFlow(flow)}
                      title="Export Flow"
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FlowsList;

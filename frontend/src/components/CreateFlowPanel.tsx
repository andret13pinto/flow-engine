import React, { useState } from "react";
import { Node, Flow, NodeType } from "../types";
import { generateId, assignIdsToNodes } from "../flowUtils";
import {
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface CreateFlowPanelProps {
  onFlowCreated: (flow: Flow) => void;
  apiUrl: string;
}

const CreateFlowPanel: React.FC<CreateFlowPanelProps> = ({
  onFlowCreated,
  apiUrl,
}) => {
  const [newFlowName, setNewFlowName] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | 0>(0);
  const [newNodeConfig, setNewNodeConfig] = useState("");
  const [nodesWithoutIds, setNodesWithoutIds] = useState<Omit<Node, "id">[]>(
    [],
  );

  const nodeTypeOptions = [
    { label: "Read from Google Docs", value: NodeType.READ_FROM_GOOGLE_DOCS },
    { label: "Write to Google Docs", value: NodeType.WRITE_TO_GOOGLE_DOCS },
    { label: "Prompt LLM", value: NodeType.PROMPT_LLM },
  ];

  const renderConfigInput = () => {
    switch (selectedNodeType) {
      case NodeType.READ_FROM_GOOGLE_DOCS:
      case NodeType.WRITE_TO_GOOGLE_DOCS:
        return (
          <input
            type="text"
            value={newNodeConfig}
            onChange={(e) => setNewNodeConfig(e.target.value)}
            placeholder="File Path"
            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        );
      case NodeType.PROMPT_LLM:
        return (
          <textarea
            value={newNodeConfig}
            onChange={(e) => setNewNodeConfig(e.target.value)}
            placeholder="Prompt"
            className="w-full rounded border border-gray-300 px-4 py-2 h-24 resize-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        );
      default:
        return <div className="h-24" />;
    }
  };

  const addNode = () => {
    if (!selectedNodeType) {
      alert("Please select a node type.");
      return;
    }
    setNodesWithoutIds((prev) => [
      ...prev,
      { type: selectedNodeType, config: newNodeConfig },
    ]);

    setSelectedNodeType(0);
    setNewNodeConfig("");
  };

  const deleteNode = (nodeId: string) => {
    setNodesWithoutIds((prev) => prev.filter((node) => node.id !== nodeId));
  };

  const createFlow = async () => {
    if (!newFlowName.trim()) {
      return alert("Flow name is required!");
    }
    if (nodesWithoutIds.length === 0) {
      return alert("Please add at least one node!");
    }

    // Assign IDs to all nodes
    const nodesWithIds = assignIdsToNodes(nodesWithoutIds);

    const newFlow: Flow = {
      id: generateId(),
      name: newFlowName,
      nodes: nodesWithIds,
    };

    console.log("Creating flow:", newFlow);

    try {
      const response = await fetch(`${apiUrl}/flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlow),
      });
      if (!response.ok) {
        throw new Error("Failed to create flow");
      }
      const createdFlow: Flow = await response.json();

      onFlowCreated(createdFlow);
      setNewFlowName("");
      setNodesWithoutIds([]);
    } catch (err) {
      console.error("Error creating flow:", err);
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-700">Create Flow</h2>
      </div>

      {/* Flow Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Flow Name
        </label>
        <input
          type="text"
          value={newFlowName}
          onChange={(e) => setNewFlowName(e.target.value)}
          placeholder="Enter flow name"
          className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      {/* Node Creation Section */}
      <div className="mb-6">
        <h3 className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-2">
          <DocumentPlusIcon className="h-5 w-5 text-blue-600" />
          <span>Add Nodes</span>
        </h3>

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Node Type
        </label>
        <select
          value={selectedNodeType}
          onChange={(e) =>
            setSelectedNodeType(Number(e.target.value) as NodeType)
          }
          className="w-full rounded border border-gray-300 px-4 py-2 mb-3 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          <option value={0}>Select Node Type</option>
          {nodeTypeOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {renderConfigInput()}

        <button
          onClick={addNode}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition-colors mt-4 w-full flex items-center justify-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Node</span>
        </button>
      </div>

      {/* Nodes Table */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">Nodes</h3>
        <div className="overflow-y-auto max-h-60">
          <table className="table-auto w-full text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 border-b border-gray-200">Type</th>
                <th className="px-4 py-2 border-b border-gray-200">Config</th>
                <th className="px-4 py-2 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodesWithoutIds.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-center text-gray-400"
                  >
                    No nodes added yet.
                  </td>
                </tr>
              ) : (
                nodesWithoutIds.map((node) => (
                  <tr
                    key={node.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 border-b border-gray-100">
                      {
                        nodeTypeOptions.find((opt) => opt.value === node.type)
                          ?.label
                      }
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      <div className="max-w-[200px] overflow-x-auto">
                        <pre className="whitespace-pre-wrap text-sm">
                          {node.config}
                        </pre>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      <button
                        onClick={() => deleteNode(node.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition flex items-center space-x-1"
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Flow Button */}
      <div>
        <button
          onClick={createFlow}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded shadow-sm hover:bg-blue-700 transition-colors w-full"
        >
          Create Flow
        </button>
      </div>
    </div>
  );
};

export default CreateFlowPanel;

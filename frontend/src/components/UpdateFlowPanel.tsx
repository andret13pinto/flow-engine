import React, { useState } from "react";
import { Flow, NodeType, NodeTypeNames } from "../types";
import {
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { generateId } from "../flowUtils";

interface UpdateFlowPanelProps {
  flow: Flow;
  onSave: (updatedFlow: Flow) => void;
  onCancel: () => void;
}

const UpdateFlowPanel: React.FC<UpdateFlowPanelProps> = ({
  flow,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(flow.name);
  const [nodes, setNodes] = useState(flow.nodes || []);
  const [defaultNodeType, setDefaultNodeType] = useState<NodeType>(
    NodeType.READ_FROM_GOOGLE_DOCS,
  );

  const updateNode = (index: number, key: string, value: any) => {
    const updatedNodes = [...nodes];
    updatedNodes[index] = { ...updatedNodes[index], [key]: value };
    setNodes(updatedNodes);
  };

  const removeNode = (index: number) => {
    const updatedNodes = nodes.filter((_, i) => i !== index);
    setNodes(updatedNodes);
  };

  const addNode = () => {
    setNodes([
      ...nodes,
      { id: generateId(), type: defaultNodeType, config: "" },
    ]);
  };

  const handleSave = () => {
    onSave({ ...flow, name, nodes });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Panel Title */}
      <h2 className="text-2xl font-semibold mb-6">Update Flow</h2>

      {/* Flow Name */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Flow Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Nodes Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Nodes</h3>
        <ul className="space-y-4">
          {nodes.map((node, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 bg-gray-50 p-3 rounded border border-gray-200"
            >
              {/* Node Type Dropdown */}
              <select
                value={node.type}
                onChange={(e) =>
                  updateNode(index, "type", parseInt(e.target.value))
                }
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0 flex-1"
              >
                {Object.entries(NodeTypeNames).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Config Input */}
              <input
                type="text"
                placeholder="Write your config here"
                value={node.config || ""}
                onChange={(e) => {
                  const newValue = e.target.value;
                  updateNode(index, "config", newValue);
                }}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />

              {/* Remove Node Button */}
              <button
                onClick={() => removeNode(index)}
                title="Remove Node"
                className="mt-2 sm:mt-0 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>

        {/* Add Node Button */}
        <button
          onClick={addNode}
          title="Add Node"
          className="mt-4 p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Save & Cancel Buttons */}
      <div className="flex items-center space-x-2 mt-8">
        {/* Save Flow */}
        <button
          onClick={handleSave}
          title="Save Flow"
          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
        >
          <CheckIcon className="h-5 w-5" />
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          title="Cancel"
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default UpdateFlowPanel;

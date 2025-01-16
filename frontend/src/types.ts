// types.ts
export enum NodeType {
  READ_FROM_GOOGLE_DOCS = 1,
  WRITE_TO_GOOGLE_DOCS = 2,
  PROMPT_LLM = 3,
}

export const NodeTypeNames: Record<NodeType, string> = {
  [NodeType.READ_FROM_GOOGLE_DOCS]: "Read from Google Docs",
  [NodeType.WRITE_TO_GOOGLE_DOCS]: "Write to Google Docs",
  [NodeType.PROMPT_LLM]: "Prompt LLM",
};

export enum FlowState {
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  COMPLETED_SUCESSFULLY = 3,
  COMPLETED_WITH_ERRORS = 4,
}

export const FlowStateNames: Record<FlowState, string> = {
  [FlowState.NOT_STARTED]: "Not Started",
  [FlowState.IN_PROGRESS]: "In Progress",
  [FlowState.COMPLETED_SUCESSFULLY]: "Completed Successfully",
  [FlowState.COMPLETED_WITH_ERRORS]: "Completed with Errors",
};

export interface Node {
  id: string;
  type: NodeType; // Now we store the enum (which is numeric)
  config: string;
}

export interface Flow {
  id: string;
  name: string;
  nodes: Node[];
  state: FlowState;
}

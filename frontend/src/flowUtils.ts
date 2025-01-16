// flowUtils.ts
export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export const assignIdsToNodes = (nodes: Omit<Node, "id">[]): Node[] =>
  nodes.map((node) => ({
    ...node,
    id: generateId(),
  }));

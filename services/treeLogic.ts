import { TreeNode } from '../types';

// Helper to create a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const createInitialTree = (): TreeNode => {
  return {
    id: 'root',
    prompt: 'How to design an efficient mechanical system',
    level: 0,
    score: 0,
    isExpanded: false,
    children: [],
  };
};

export const countNodes = (node: TreeNode): number => {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
};

export const getTreeStats = (root: TreeNode) => {
  let total = 0;
  let expanded = 0;
  let maxLevel = 0;

  const traverse = (node: TreeNode) => {
    total++;
    if (node.isExpanded) expanded++;
    if (node.level > maxLevel) maxLevel = node.level;
    node.children.forEach(traverse);
  };

  traverse(root);
  return {
    totalNodes: total,
    expandedNodes: expanded,
    unexpandedNodes: total - expanded,
    maxLevel,
  };
};

export const findUnexpandedNodes = (root: TreeNode, maxDepth: number): TreeNode[] => {
  const unexpanded: TreeNode[] = [];
  // Use a simple index to track DFS order (Left-to-Right)
  let visitOrder = 0;
  
  const traverse = (node: TreeNode) => {
    // If it's not expanded and hasn't reached max depth
    if (!node.isExpanded && node.level < maxDepth) {
      // We attach a temporary sort index property (conceptually)
      // Here we rely on the array push order which follows DFS
      (node as any)._dfsIndex = visitOrder++;
      unexpanded.push(node);
    }
    // Continue traversing even if this specific node is expanded
    node.children.forEach(traverse);
  };

  traverse(root);
  
  // Sort Logic:
  // 1. Level DESC (Deepest first) -> This ensures "Depth-First" priority over breadth.
  // 2. Index ASC (Left-most first) -> This ensures we stick to the current branch instead of jumping to a sibling's branch at the same level.
  return unexpanded.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return ((a as any)._dfsIndex || 0) - ((b as any)._dfsIndex || 0);
  });
};

// Simulate the AI scoring and expansion
export const expandNodeLogic = (node: TreeNode): TreeNode[] => {
  const newChildren: TreeNode[] = [];
  // Randomly decide 1-3 children to simulate variable AI output
  const childCount = Math.floor(Math.random() * 3) + 1;

  const methods = ['Structure Optimization', 'Material Selection', 'Process Improvement', 'Thermal Analysis', 'Cost Reduction', 'AI Integration'];

  for (let i = 0; i < childCount; i++) {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const child: TreeNode = {
      id: `${node.id}_${generateId()}`,
      prompt: `${method} (Sub-solution ${i + 1})`,
      level: node.level + 1,
      score: Math.random(), // Random score 0-1
      isExpanded: false,
      children: [],
      parentId: node.id
    };
    newChildren.push(child);
  }
  return newChildren;
};

// Immutable tree update helper
export const updateTreeWithNewNodes = (root: TreeNode, parentId: string, newChildren: TreeNode[]): TreeNode => {
  if (root.id === parentId) {
    return {
      ...root,
      isExpanded: true,
      children: [...root.children, ...newChildren]
    };
  }

  return {
    ...root,
    children: root.children.map(child => updateTreeWithNewNodes(child, parentId, newChildren))
  };
};
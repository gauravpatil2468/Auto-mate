"use client";
import AppBar from "@/components/AppBar";
import { DarkButton } from "@/components/buttons/DarkButton";
import React, { useCallback, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

interface CustomNodeData {
  index: number;
  type?: string; // Optional type name
}

export default function FlowBuilder() {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([
    {
      id: "1",
      type: "default",
      position: { x: 250, y: 50 },
      data: { index: 1 },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const addActionNode = () => {
    const newIndex = nodes.length + 1; // Numbering starts from 2
    const newNodeId = newIndex.toString();

    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: "default",
      position: { x: 250, y: newIndex * 80 },
      data: { index: newIndex },
    };

    setNodes((prev) => [...prev, newNode]);

    const newEdge: Edge = { id: `e-${newNodeId}`, source: "1", target: newNodeId };
    setEdges((prev) => [...prev, newEdge]);
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((prevEdges) => addEdge(params, prevEdges));
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <AppBar />
      <div className="flex-grow bg-slate-200 relative">
        {/* Add Action Button */}
        <div className="absolute top-4 right-4 z-10 pointer-events-auto">
          <DarkButton onClick={addActionNode}>+ Add Action</DarkButton>
        </div>

        {/* Flow Canvas */}
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                label: `${node.data.index}. ${node.data.type || (node.data.index === 1 ? "Trigger" : "Action")}`,
              },
            }))}
            edges={edges}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

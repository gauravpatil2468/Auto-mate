"use client";
import AppBar from "@/components/AppBar";
import { DarkButton } from "@/components/buttons/DarkButton";
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  useNodesInitialized,
} from "reactflow";
import "reactflow/dist/style.css";

interface CustomNodeData {
  index: number;
  type?: string;
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

function FlowCanvas() {
  const { setViewport, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // 📌 Initialize the trigger node at center and 25% from top
  useEffect(() => {
    const triggerNode: Node<CustomNodeData> = {
      id: "1",
      type: "default",
      position: { x: 0, y: 0 }, // Temporary position
      data: { index: 1 },
    };

    setNodes([triggerNode]);
  }, []);

  // 📌 Center the nodes after they are initialized
  useEffect(() => {
    if (nodesInitialized) {
      fitView({ padding: 0.5, duration: 300 });
    }
  }, [nodesInitialized, fitView]);

  const addActionNode = () => {
    const newIndex = nodes.length + 1;
    const newNodeId = newIndex.toString();

    const lastNode = nodes[nodes.length - 1];
    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: "default",
      position: { x: lastNode.position.x, y: lastNode.position.y + 80 }, // Add below last node
      data: { index: newIndex },
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, { id: `e-${newNodeId}`, source: "1", target: newNodeId }]);

    fitView({ padding: 0.5, duration: 300 }); // Keep nodes visible
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((prevEdges) => addEdge(params, prevEdges));
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <AppBar />
      <div className="flex-grow bg-slate-200 relative">
        <div className="absolute top-4 right-4 z-10">
          <DarkButton onClick={addActionNode}>+ Add Action</DarkButton>
        </div>

        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: { ...node.data, label: `${node.data.index}. ${node.data.type || (node.data.index === 1 ? "Trigger" : "Action")}` },
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

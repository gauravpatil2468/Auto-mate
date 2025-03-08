"use client";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/app/config";
import AppBar from "@/components/AppBar";
import { DarkButton } from "@/components/buttons/DarkButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
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
  NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { Input } from "@/components/Input";


interface CustomNodeData {
  index: number;
  type: "Trigger" | "Action";
  name?: string;
  image?: string;
  id?: string;
  metadata?: any;
}

interface ActionOrTrigger {
  id: string;
  name: string;
  image: string;
}

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState<ActionOrTrigger[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<ActionOrTrigger[]>([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then(res => setAvailableTriggers(res.data.availableTriggers))
      .catch(err => console.error("Failed to fetch triggers:", err));

    axios.get(`${BACKEND_URL}/api/v1/action/available`)
      .then(res => setAvailableActions(res.data.availableActions))
      .catch(err => console.error("Failed to fetch actions:", err));
  }, []);

  return { availableActions, availableTriggers };
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

function FlowCanvas() {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);

  useEffect(() => {
    setNodes([
      {
        id: "1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { index: 1, type: "Trigger" },
      },
    ]);
  }, []);

  useEffect(() => {
    if (nodesInitialized) {
      fitView({ padding: 0.5, duration: 300 });
    }
  }, [nodesInitialized, fitView]);

  const addActionNode = () => {
    const newIndex = nodes.length + 1;
    const lastNode = nodes[nodes.length - 1];

    const newNode: Node<CustomNodeData> = {
      id: newIndex.toString(),
      type: "default",
      position: { x: lastNode.position.x, y: lastNode.position.y + 80 },
      data: { index: newIndex, type: "Action" },
    };

    setNodes([...nodes, newNode]);
    setEdges([...edges, { id: `e-${newIndex}`, source: lastNode.id, target: newNode.id }]);

    fitView({ padding: 0.5, duration: 300 });
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((prevEdges) => addEdge(params, prevEdges));
  }, []);

  const onNodeClick: NodeMouseHandler = (event, node) => {
    setSelectedNode(node);
  };

  const handleSelect = (item: ActionOrTrigger,metadata: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNode?.id
          ? { ...node, data: { ...node.data, name: item.name, id: item.id, image: item.image, metadata: metadata } }
          : node
      )
    );
    setSelectedNode(null);
  };

  const publishZap = async () => {
    const triggerNode = nodes.find((node) => node.data.type === "Trigger");
    const actionNodes = nodes.filter((node) => node.data.type === "Action");

    if (!triggerNode || !triggerNode.data.id || triggerNode.data.id === "1") {
      alert("Please select a trigger before publishing.");
      return;
    }

    if (actionNodes.length === 0) {
      alert("Please add at least one action before publishing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication error: Please log in again.");
      return;
    }

    const zapData = {
      availableTriggerId: triggerNode.data.id,
      triggerMetadata: triggerNode.data.metadata || {},
      actions: actionNodes.map((node) => ({
        availableActionId: node.data.id || "",
        actionMetadata: node.data.metadata || {},
      })),
    };

    try {
      await axios.post(`${BACKEND_URL}/api/v1/zap`, zapData, {
        headers: {
          Authorization: `${token}`,
        },
      });
      alert("Zap published successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error publishing zap:", error);
      alert("Failed to publish zap. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <AppBar />
      <div className="flex-grow bg-slate-200 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <DarkButton onClick={addActionNode}>+ Add Action</DarkButton>
          <PrimaryButton onClick={publishZap}>Publish</PrimaryButton>
        </div>

        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                label: `${node.data.index}. ${node.data.name || node.data.type}`,
              },
            }))}
            edges={edges}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>

      {selectedNode && (
        <Modal
          node={selectedNode}
          items={selectedNode.data.type === "Trigger" ? availableTriggers : availableActions}
          onSelect={handleSelect}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
function Modal({
  node,
  items,
  onSelect,
  onClose,
}: {
  node: Node<CustomNodeData>;
  items: ActionOrTrigger[];
  onSelect: (item: ActionOrTrigger, metadata: any) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ActionOrTrigger | null>(null);
  const [metadata, setMetadata] = useState({});
  const isTrigger = node.data.type === "Trigger";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Select {isTrigger ? "Trigger" : "Action"}
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isTrigger) {
                      onSelect(item, {});
                      onClose();
                    } else {
                      setSelectedAction(item);
                      setStep(1);
                    }
                  }}
                  className="flex items-center w-full p-2 border rounded-lg hover:bg-gray-100"
                >
                  <img src={item.image} alt={item.name} className="w-10 h-10 mr-2" />
                  {item.name}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && selectedAction && (
          <div className="border border-slate-400 rounded m-2 p-3">
            <h2 className="text-lg font-semibold mb-2">Configure {selectedAction.name}</h2>
            {selectedAction.name === "email" && (
              <EmailSelector setMetadata={setMetadata} />
            )}
            {selectedAction.name === "send solana" && (
              <SolanaSelector setMetadata={setMetadata} />
            )}

            <div className="mt-4 flex justify-center gap-5">
              <button
                onClick={() => setStep(0)}
                className="text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => {
                  onSelect(selectedAction, metadata);
                  onClose();
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full text-center text-red-500">
          Cancel
        </button>
      </div>
    </div>
  );
}

function EmailSelector({ setMetadata }: { setMetadata: (metadata: any) => void }) {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setMetadata({ to, body });
  }, [to, body, setMetadata]);

  return (
    <div>
      <Input label="To" type="text" placeholder="To" onChange={(e) => setTo(e.target.value)} />
      <Input label="Body" type="text" placeholder="Body" onChange={(e) => setBody(e.target.value)} />
    </div>
  );
}

function SolanaSelector({ setMetadata }: { setMetadata: (metadata: any) => void }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setMetadata({ to, amount });
  }, [to, amount, setMetadata]);

  return (
    <div>
      <Input label="To" type="text" placeholder="To" onChange={(e) => setTo(e.target.value)} />
      <Input label="Amount" type="text" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
    </div>
  );
}
import { useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { toast } from "sonner";

interface Node {
  id: string;
  name: string;
  val: number;
  color?: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface TransactionGraphProps {
  data: GraphData;
  onNodeClick: (nodeId: string) => void;
}

export const TransactionGraph = ({ data, onNodeClick }: TransactionGraphProps) => {
  const graphRef = useRef<any>();

  useEffect(() => {
    if (graphRef.current) {
      // Adjust force parameters for better visualization
      graphRef.current.d3Force("charge").strength(-400);
      graphRef.current.d3Force("link").distance(200);
      graphRef.current.d3Force("center").strength(0.8);
    }
  }, []);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden backdrop-blur-lg bg-white/5 border border-solana-purple/20 animate-fade-in">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeColor={(node: any) => node.color || "#9945FF"}
        linkColor={() => "#14F195"}
        nodeRelSize={6}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={(node: any) => {
          toast.info("Loading transactions...");
          onNodeClick(node.id);
        }}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.color || "#9945FF";
          ctx.fillText(label, node.x, node.y + 8);
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = node.color || "#9945FF";
          ctx.fill();
        }}
      />
    </div>
  );
};
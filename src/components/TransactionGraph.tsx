import { useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { toast } from "sonner";

interface Node {
  id: string;
  name: string;
  val: number;
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
      graphRef.current.d3Force("charge").strength(-400);
    }
  }, []);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden backdrop-blur-lg bg-white/5 border border-solana-purple/20 animate-fade-in">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeColor={() => "#9945FF"}
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
          ctx.fillStyle = "#9945FF";
          ctx.fillText(label, node.x, node.y + 8);
        }}
      />
    </div>
  );
};
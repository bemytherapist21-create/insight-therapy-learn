import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

const stages = [
  { label: "Step 1: Extracting resume data...", duration: 10000 },
  { label: "Step 2: Analyzing company brand identity...", duration: 10000 },
  { label: "Step 3: Transforming content with brand voice...", duration: 25000 },
  { label: "Step 4: Generating themed HTML resume...", duration: 35000 },
  { label: "Finalizing & polishing...", duration: 20000 },
];

export const GenerationProgress = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 200;
      const pct = Math.min((elapsed / totalDuration) * 95, 95); // never reach 100 until done
      setProgress(pct);

      // determine stage
      let acc = 0;
      for (let i = 0; i < stages.length; i++) {
        acc += stages[i].duration;
        if (elapsed < acc) {
          setStageIndex(i);
          break;
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card p-12 text-center space-y-6">
      <Sparkles className="w-12 h-12 mx-auto text-emerald-400 animate-pulse" />
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">
          {stages[stageIndex]?.label}
        </p>
        <Progress value={progress} className="h-2 max-w-xs mx-auto" />
        <p className="text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        4-step AI pipeline: Extract → Brand Analysis → Transform → Generate
      </p>
    </Card>
  );
};

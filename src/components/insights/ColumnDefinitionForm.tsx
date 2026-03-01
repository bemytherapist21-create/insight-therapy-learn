import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Columns, CheckCircle } from "lucide-react";

interface Column {
  name: string;
  dataType: string;
  nullPercentage?: number;
  uniqueValues?: number;
  sampleValues?: string[];
  summary?: string;
}

interface Sheet {
  name: string;
  columns: Column[];
  rowCount?: number;
}

interface ColumnDefinitionFormProps {
  structure: { sheets: Sheet[] };
  onSubmit: (definitions: Record<string, string>) => void;
}

const dataTypeBadgeColor: Record<string, string> = {
  numeric: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  categorical: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  date: "bg-green-500/20 text-green-300 border-green-500/30",
  text: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  boolean: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const ColumnDefinitionForm = ({ structure, onSubmit }: ColumnDefinitionFormProps) => {
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(
    new Set(structure.sheets.map((s) => s.name))
  );

  const toggleSheet = (name: string) => {
    setExpandedSheets((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleDefinitionChange = (sheetName: string, colName: string, value: string) => {
    setDefinitions((prev) => ({
      ...prev,
      [`${sheetName}.${colName}`]: value,
    }));
  };

  const definedCount = Object.values(definitions).filter((v) => v.trim()).length;
  const totalColumns = structure.sheets.reduce((sum, s) => sum + s.columns.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns className="w-5 h-5 text-primary" />
          <span className="text-white font-semibold">
            {definedCount}/{totalColumns} columns defined
          </span>
        </div>
      </div>

      {structure.sheets.map((sheet) => (
        <div key={sheet.name} className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSheet(sheet.name)}
            className="w-full flex items-center justify-between p-4 text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSheets.has(sheet.name) ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              <span className="font-semibold">{sheet.name}</span>
              {sheet.rowCount && (
                <span className="text-white/50 text-sm">({sheet.rowCount} rows)</span>
              )}
            </div>
            <Badge variant="outline" className="text-white/70">
              {sheet.columns.length} columns
            </Badge>
          </button>

          {expandedSheets.has(sheet.name) && (
            <div className="px-4 pb-4 space-y-3">
              {sheet.columns.map((col) => {
                const key = `${sheet.name}.${col.name}`;
                const isDefined = !!definitions[key]?.trim();
                return (
                  <div
                    key={col.name}
                    className={`p-3 rounded-lg border transition-colors ${
                      isDefined ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isDefined && <CheckCircle className="w-4 h-4 text-green-400" />}
                      <span className="text-white font-medium">{col.name}</span>
                      <Badge className={dataTypeBadgeColor[col.dataType] || "bg-gray-500/20 text-gray-300"}>
                        {col.dataType}
                      </Badge>
                      {col.nullPercentage !== undefined && col.nullPercentage > 0 && (
                        <span className="text-white/40 text-xs">{col.nullPercentage}% null</span>
                      )}
                    </div>
                    {col.sampleValues && col.sampleValues.length > 0 && (
                      <p className="text-white/40 text-xs mb-2">
                        Samples: {col.sampleValues.slice(0, 4).join(", ")}
                      </p>
                    )}
                    <Input
                      placeholder={`What does "${col.name}" mean in your data?`}
                      value={definitions[key] || ""}
                      onChange={(e) => handleDefinitionChange(sheet.name, col.name, e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={() => onSubmit(definitions)}
        className="w-full bg-gradient-primary hover:shadow-glow"
        size="lg"
      >
        Continue to Business Context
      </Button>
    </div>
  );
};

export default ColumnDefinitionForm;

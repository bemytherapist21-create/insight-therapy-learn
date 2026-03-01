import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Search,
  Target,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface InsightsData {
  executive_summary?: string;
  descriptive?: { title: string; finding: string; metric?: string; chart_type?: string }[];
  diagnostic?: { title: string; finding: string; root_cause?: string }[];
  predictive?: { title: string; prediction: string; confidence?: string; timeframe?: string }[];
  strategic?: { title: string; recommendation: string; impact?: string; effort?: string }[];
  risks?: { title: string; description: string; severity?: string }[];
  market_context?: string;
  kpis?: { name: string; value: string; trend?: string; description?: string }[];
}

interface InsightsDashboardProps {
  insights: InsightsData;
  isStreaming: boolean;
}

const CHART_COLORS = ["#8b5cf6", "#f97316", "#06b6d4", "#10b981", "#f43f5e", "#eab308"];

const trendIcon = (trend?: string) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-white/40" />;
};

const severityColor: Record<string, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-300 border-green-500/30",
};

const InsightsDashboard = ({ insights, isStreaming }: InsightsDashboardProps) => {
  // Generate simple chart data from KPIs
  const kpiChartData = insights.kpis?.map((kpi, i) => ({
    name: kpi.name,
    value: parseFloat(kpi.value.replace(/[^0-9.-]/g, "")) || (i + 1) * 10,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Summary */}
      {insights.executive_summary && (
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 leading-relaxed">{insights.executive_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {insights.kpis && insights.kpis.length > 0 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {insights.kpis.map((kpi, i) => (
              <Card key={i} className="glass-card hover-lift">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{kpi.name}</p>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {trendIcon(kpi.trend)}
                    <span className="text-white/40 text-xs">{kpi.trend || "stable"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Chart Section */}
      {kpiChartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white text-sm">KPI Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kpiChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                  <Bar dataKey="value" fill="hsl(270, 91%, 65%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white text-sm">Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={kpiChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {kpiChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insight Layers */}
      {[
        { key: "descriptive", title: "Descriptive — What Happened?", icon: BarChart3, items: insights.descriptive },
        { key: "diagnostic", title: "Diagnostic — Why?", icon: Search, items: insights.diagnostic },
        { key: "predictive", title: "Predictive — What May Happen?", icon: Lightbulb, items: insights.predictive },
        { key: "strategic", title: "Strategic — What To Do?", icon: Target, items: insights.strategic },
      ].map(({ key, title, icon: Icon, items }) =>
        items && items.length > 0 ? (
          <div key={key}>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              {title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {items.map((item: any, i: number) => (
                <Card key={i} className="glass-card hover-lift">
                  <CardContent className="pt-4">
                    <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                    <p className="text-white/70 text-sm">
                      {item.finding || item.prediction || item.recommendation}
                    </p>
                    {item.root_cause && (
                      <p className="text-white/50 text-xs mt-2">Root cause: {item.root_cause}</p>
                    )}
                    {item.confidence && (
                      <Badge className={`mt-2 ${severityColor[item.confidence] || ""}`}>
                        {item.confidence} confidence
                      </Badge>
                    )}
                    {item.impact && (
                      <div className="flex gap-2 mt-2">
                        <Badge className={severityColor[item.impact] || ""}>Impact: {item.impact}</Badge>
                        {item.effort && <Badge className={severityColor[item.effort] || ""}>Effort: {item.effort}</Badge>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Risks */}
      {insights.risks && insights.risks.length > 0 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Risk Identification
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.risks.map((risk, i) => (
              <Card key={i} className="glass-card border-yellow-500/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{risk.title}</h4>
                    {risk.severity && (
                      <Badge className={severityColor[risk.severity] || ""}>{risk.severity}</Badge>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">{risk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Market Context */}
      {insights.market_context && (
        <Card className="glass-card border-accent/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              External Market Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 leading-relaxed">{insights.market_context}</p>
          </CardContent>
        </Card>
      )}

      {isStreaming && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm">Generating insights...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsDashboard;

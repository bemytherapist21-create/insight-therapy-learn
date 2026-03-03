import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, Lightbulb, Search, AlertTriangle, Globe, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

interface InsightsDashboardProps {
    insights: any;
    isStreaming: boolean;
}

const CHART_COLORS = ["#8A2BE2", "#FF8C00", "#4facfe", "#00f2fe", "#f093fb", "#f5576c"];

const trendIcon = (trend?: string) => {
    if (trend?.toLowerCase() === "up") return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend?.toLowerCase() === "down") return <TrendingDown className="w-3 h-3 text-red-400" />;
    return null;
};

const severityColor: Record<string, string> = {
    high: "bg-red-500/20 text-red-300 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    low: "bg-green-500/20 text-green-300 border-green-500/30",
};

const InsightsDashboard = ({ insights, isStreaming }: InsightsDashboardProps) => {
    const kpiChartData = insights.kpis?.map((kpi: any, i: number) => ({
        name: kpi.name,
        value: parseFloat(kpi.value.replace(/[^0-9.-]/g, "")) || (i + 1) * 10,
    })) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {insights.executive_summary && (
                <Card className="glass-card border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-xl">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{insights.executive_summary}</p>
                    </CardContent>
                </Card>
            )}

            {insights.kpis && insights.kpis.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {insights.kpis.map((kpi: any, i: number) => (
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
            )}

            {/* Charts Section */}
            {kpiChartData.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="glass-card">
                        <CardHeader><CardTitle className="text-white/80 text-sm">KPI Overview</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={kpiChartData}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "none" }} />
                                    <Bar dataKey="value" fill="#8A2BE2" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader><CardTitle className="text-white/80 text-sm">Distribution</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={kpiChartData} dataKey="value" stroke="none">
                                        {kpiChartData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "none" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Layered Insights */}
            {[
                { title: "Descriptive Insights", icon: Search, items: insights.descriptive },
                { title: "Diagnostic Analysis", icon: Lightbulb, items: insights.diagnostic },
                { title: "Predictive Forecasts", icon: Globe, items: insights.predictive },
                { title: "Strategic Recommendations", icon: Target, items: insights.strategic },
            ].map((layer, idx) => (
                layer.items && layer.items.length > 0 && (
                    <div key={idx} className="space-y-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <layer.icon className="w-5 h-5 text-primary" />
                            {layer.title}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {layer.items.map((item: any, i: number) => (
                                <Card key={i} className="glass-card">
                                    <CardContent className="pt-4">
                                        <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                                        <p className="text-white/70 text-sm">{item.finding || item.recommendation || item.prediction}</p>
                                        {item.impact && <Badge className="mt-2 mr-2 bg-primary/20">{item.impact} impact</Badge>}
                                        {item.confidence && <Badge className="mt-2 bg-green-500/20">{item.confidence} confidence</Badge>}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            ))}

            {isStreaming && (
                <div className="flex items-center justify-center gap-2 text-primary animate-pulse py-4">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">Processing Data Stream...</span>
                </div>
            )}
        </div>
    );
};

export default InsightsDashboard;

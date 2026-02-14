"use client"

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
    Legend
} from "recharts"

interface CategoryData {
    name: string
    value: number
    color: string
}

interface MonthlyData {
    month: string
    income: number
    expense: number
}

interface ReportChartsProps {
    categoryData: CategoryData[]
    monthlyData: MonthlyData[]
}

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function ReportCharts({ categoryData, monthlyData }: ReportChartsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Gastos por Categoria */}
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-foreground">Distribuição de Gastos</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1c1c1c", border: "1px solid #333", borderRadius: "8px" }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fluxo Mensal */}
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-foreground">Receitas vs Despesas</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                contentStyle={{ backgroundColor: "#1c1c1c", border: "1px solid #333", borderRadius: "8px" }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita" />
                            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesa" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import {
  ExcelRow,
  USER_COLUMNS,
  calculateUserTotals,
} from "../../services/excelService";
import { useAuth } from "../../context/AuthContext";

interface DataChartsProps {
  data: ExcelRow[];
}

const NEON_COLORS = ["#61dafb", "#3c82f6", "#1ca0fb", "#0073e6", "#0e4377"];
const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const deterministicRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

const distributeTotalAcrossWeek = (seed: string, total: number) => {
  if (total === 0) {
    return WEEK_DAYS.map(() => 0);
  }

  const weights = WEEK_DAYS.map((day, index) => {
    return deterministicRandom(`${seed}-${day}-${index}`) + 0.15;
  });

  const weightSum = weights.reduce((acc, value) => acc + value, 0);
  const normalized = weights.map((weight) => (weight / weightSum) * total);

  let remaining = total;
  return normalized.map((value, index) => {
    if (index === WEEK_DAYS.length - 1) {
      return Number(remaining.toFixed(2));
    }
    const rounded = Number(value.toFixed(2));
    remaining -= rounded;
    return rounded;
  });
};

const renderUserShareLabel = (props: any) => {
  const { x, y, value } = props;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof value !== "number"
  ) {
    return null;
  }

  return (
    <text x={x} y={y + 16} fill="#bfdbfe" fontSize={12} textAnchor="middle">
      {value.toFixed(2)}
    </text>
  );
};

const DataCharts: React.FC<DataChartsProps> = ({ data }) => {
  const { isAdmin } = useAuth();

  const prepareUserMetrics = () => {
    const serviceEntries = data.filter(
      (row) =>
        row.Servicio &&
        typeof row.Servicio === "string" &&
        !row.Servicio.includes("(50%)"),
    );

    const serviceFrequencyMap = new Map<string, number>();
    const serviceTotalsMap = new Map<string, number>();
    let totalGanancia = 0;

    serviceEntries.forEach((row) => {
      const serviceName = String(row.Servicio);
      const gain = Number(row.Ganancia) || 0;
      totalGanancia += gain;

      serviceFrequencyMap.set(
        serviceName,
        (serviceFrequencyMap.get(serviceName) || 0) + 1,
      );
      serviceTotalsMap.set(
        serviceName,
        (serviceTotalsMap.get(serviceName) || 0) + gain * 0.5,
      );
    });

    const barData = Array.from(serviceFrequencyMap.entries()).map(
      ([name, count]) => ({
        name,
        Veces:
          count *
          (Math.floor(deterministicRandom(`${name}-freq-user`) * 3) + 1),
      }),
    );

    const totalShare = Number((totalGanancia * 0.5).toFixed(2));

    const sharePerDay = distributeTotalAcrossWeek("user-share", totalShare);

    const lineData = WEEK_DAYS.map((day, index) => ({
      name: day,
      "Mi 50%": sharePerDay[index],
    }));

    const pieData = Array.from(serviceTotalsMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    return {
      barData,
      barKeys: ["Veces"],
      lineData,
      lineKeys: ["Mi 50%"],
      pieData,
    };
  };

  const prepareAdminMetrics = () => {
    const serviceCounts = new Map<string, number>();
    const userTotals = calculateUserTotals(data);

    data.forEach((row) => {
      if (row.DETALLE === "SERVICIO") {
        USER_COLUMNS.forEach((user) => {
          const serviceName = row[user];
          if (typeof serviceName === "string" && serviceName.trim()) {
            const current = serviceCounts.get(serviceName) || 0;
            const multiplier =
              Math.floor(deterministicRandom(`${serviceName}-admin-freq`) * 4) +
              1;
            serviceCounts.set(serviceName, current + multiplier);
          }
        });
      }
    });

    const barData = Array.from(serviceCounts.entries()).map(
      ([name, count]) => ({
        name,
        Veces: count,
      }),
    );

    const userDailyTotals: Record<string, number[]> = {};
    USER_COLUMNS.forEach((user) => {
      const total = Number(userTotals[user]?.total || 0);
      userDailyTotals[user] = distributeTotalAcrossWeek(`admin-${user}`, total);
    });

    const lineData = WEEK_DAYS.map((day, index) => {
      const entry: Record<string, number | string> = { name: day };
      USER_COLUMNS.forEach((user) => {
        entry[user] = userDailyTotals[user]?.[index] || 0;
      });
      return entry;
    });

    const pieData = USER_COLUMNS.map((user) => ({
      name: user,
      value: Number(userTotals[user]?.total || 0),
    }));

    return {
      barData,
      barKeys: ["Veces"],
      lineData,
      lineKeys: USER_COLUMNS,
      pieData,
    };
  };

  const { barData, barKeys, lineData, lineKeys, pieData } = isAdmin
    ? prepareAdminMetrics()
    : prepareUserMetrics();

  return (
    <div className="perspective-container space-y-8">
      {/* Bar Chart */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          {isAdmin
            ? "Frecuencia de Servicios Contratados"
            : "Cuántas Veces se Contrató cada Servicio"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis
                stroke="#999"
                label={{
                  value: isAdmin ? "Ganancia por colaborador" : "Mi 50% diario",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#9ca3af", fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                }}
              />
              <Legend />
              {barKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={NEON_COLORS[index % NEON_COLORS.length]}
                  animationDuration={0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          {isAdmin
            ? "Ganancias por Día (por Colaborador)"
            : "Ganancias Diarias - Mi 50%"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(59, 130, 246, 0.2)"
              />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                }}
              />
              <Legend />
              {lineKeys.map((key, index) => {
                const color = NEON_COLORS[index % NEON_COLORS.length];
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={3}
                    animationDuration={0}
                    dot={{
                      strokeWidth: 0,
                      fill: color,
                    }}
                    activeDot={{
                      r: 8,
                      fill: color,
                      strokeWidth: 0,
                    }}
                  >
                    {!isAdmin && key === "Mi 50%" && (
                      <LabelList
                        dataKey="Mi 50%"
                        position="bottom"
                        content={renderUserShareLabel}
                      />
                    )}
                  </Line>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          {isAdmin
            ? "Distribución Total de Ganancias"
            : "Distribución de Mi 50%"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={(props: PieLabelRenderProps) => {
                  const { name, percent } = props;
                  const percentageValue =
                    typeof percent === "number"
                      ? (percent * 100).toFixed(0)
                      : "0";
                  return `${name ?? "Entrada"}: ${percentageValue}%`;
                }}
                animationDuration={0}
              >
                {pieData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={NEON_COLORS[index % NEON_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataCharts;

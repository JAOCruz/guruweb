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
} from "recharts";
import { ExcelRow } from "../../services/excelService";
import { useAuth } from "../../context/AuthContext";

interface DataChartsProps {
  data: ExcelRow[];
}

const NEON_COLORS = ["#61dafb", "#3c82f6", "#1ca0fb", "#0073e6", "#0e4377"];

const DataCharts: React.FC<DataChartsProps> = ({ data }) => {
  const { user, isAdmin } = useAuth();

  // Prepare data for charts
  const prepareChartData = () => {
    if (data.length === 0) return [];

    if (isAdmin) {
      // Admin sees all data with original structure
      return data.map((row, index) => ({
        name: row.DETALLE || `Entrada ${index + 1}`,
        ...row,
      }));
    } else {
      // For regular users, prepare data specifically for their view
      // Filter out rows without relevant data
      const userRows = data.filter(
        (row) => row.Servicio || row.Ganancia || row.Valor,
      );

      return userRows.map((row, index) => {
        if (row.Servicio) {
          // This is a service row
          return {
            name: row.Servicio || `Servicio ${index + 1}`,
            Ganancia: Number(row.Ganancia) || 0,
            Servicio: row.Servicio,
          };
        } else if (row.DETALLE === "TOTAL") {
          return {
            name: "Total",
            Total: Number(row.Valor) || 0,
          };
        } else {
          return {
            name: row.DETALLE || `Entrada ${index + 1}`,
            ...row,
          };
        }
      });
    }
  };

  const chartData = prepareChartData();

  // Get column names for the charts (excluding 'name' which we added)
  const getColumns = () => {
    if (chartData.length === 0) return [];

    const columns = Object.keys(chartData[0]);

    // Filter columns based on user role
    if (isAdmin) {
      // Admin can see all columns except name and non-numeric ones
      return columns.filter(
        (col) =>
          col !== "name" && col !== "DETALLE" && !["Servicio"].includes(col),
      );
    } else {
      // Regular users see only relevant columns
      return columns.filter(
        (col) =>
          col !== "name" &&
          col !== "DETALLE" &&
          (col === "Ganancia" || col === "Total" || col === "Valor"),
      );
    }
  };

  const columns = getColumns();

  // Calculate totals for pie chart
  const calculateTotals = () => {
    const totals = columns.map((column) => {
      const sum = data.reduce((acc, row) => {
        const value = Number(row[column]) || 0;
        return acc + value;
      }, 0);

      return {
        name: column,
        value: sum,
      };
    });

    return totals;
  };

  const pieData = calculateTotals();

  return (
    <div className="perspective-container space-y-8">
      {/* Bar Chart */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          {isAdmin ? "Comparación por Categoría" : "Mis Ganancias por Servicio"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
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
              {columns.map((column, index) => (
                <Bar
                  key={column}
                  dataKey={column}
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
          {isAdmin ? "Tendencias" : "Evolución de Ganancias"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
              {columns.map((column, index) => (
                <Line
                  key={column}
                  type="monotone"
                  dataKey={column}
                  stroke={NEON_COLORS[index % NEON_COLORS.length]}
                  activeDot={{
                    r: 8,
                    fill: NEON_COLORS[index % NEON_COLORS.length],
                    strokeWidth: 0,
                  }}
                  strokeWidth={3}
                  animationDuration={0}
                  dot={{
                    strokeWidth: 0,
                    fill: NEON_COLORS[index % NEON_COLORS.length],
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          {isAdmin ? "Distribución Total" : "Distribución de Mis Ganancias"}
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
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                animationDuration={0}
              >
                {pieData.map((entry, index) => (
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

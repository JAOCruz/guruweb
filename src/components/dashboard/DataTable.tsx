import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExcelRow } from "../../services/excelService";
import { useAuth } from "../../context/AuthContext";

interface DataTableProps {
  data: ExcelRow[];
  onSort: (column: string, direction: "asc" | "desc") => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onSort }) => {
  const { isAdmin } = useAuth();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get column names from the first row of data
  let columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Filter columns for all users
  if (isAdmin) {
    // For admin users, filter out the DETALLE column
    columns = columns.filter((col) => col !== "DETALLE");
  } else {
    // For non-admin users, filter out the empty columns and show only relevant ones
    columns = columns.filter(
      (col) =>
        col === "Servicio" ||
        col === "Ganancia" ||
        col === "DETALLE" ||
        col === "Valor",
    );
  }

  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";

    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-0 group-hover:opacity-50"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <motion.div
      className="perspective-container overflow-x-auto rounded-lg border border-blue-900/30 bg-gray-800/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="border-b border-blue-900/30 bg-gray-900/80 px-4 py-3">
        <h3 className="bevel-text text-lg font-medium">
          Mis Servicios y Ganancias
        </h3>
      </div>
      <table className="min-w-full divide-y divide-blue-900/30">
        <thead className="bg-gray-900/80">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="group cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-blue-400 uppercase hover:text-white"
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  {column}
                  <span className="ml-2">{getSortIcon(column)}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-900/20 bg-gray-800/50">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                whileHover={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)",
                }}
                className="transition-all duration-200"
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className={`px-6 py-4 text-sm whitespace-nowrap ${
                      column === "Ganancia" || column === "Valor"
                        ? "font-medium text-blue-300"
                        : "text-gray-300"
                    }`}
                  >
                    {row[column] !== undefined ? row[column] : "—"}
                  </td>
                ))}
              </motion.tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-400"
              >
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default DataTable;

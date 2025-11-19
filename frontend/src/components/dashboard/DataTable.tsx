import React, { useState } from "react";
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

  const columnSet = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((key) => columnSet.add(key));
  });

  let columns = Array.from(columnSet);

  if (isAdmin) {
    columns = columns.filter(
      (col) => !["DETALLE", "Valor", "Cliente", "Hora"].includes(col),
    );
  } else {
    const desiredOrder = ["Servicio", "Cliente", "Hora", "Ganancia"];
    columns = desiredOrder.filter((col) => columnSet.has(col));
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
    <div className="perspective-container overflow-x-auto rounded-2xl border border-blue-900/40 bg-gray-900/85 shadow-xl backdrop-blur-md">
      <div className="border-b border-blue-900/40 bg-gray-950/80 px-6 py-4">
        <h3 className="metallic-3d-text text-2xl font-semibold tracking-[0.25em] text-blue-200 uppercase">
          Mis Servicios y Ganancias
        </h3>
      </div>
      <table className="min-w-full divide-y divide-blue-900/30 text-base">
        <thead className="bg-gray-950/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="group cursor-pointer px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase hover:text-white"
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
        <tbody className="divide-y divide-blue-900/20 bg-gray-900/40">
          {data.length > 0 ? (
            data.map((row, rowIndex) => {
              const isSummaryRow =
                typeof row.Servicio === "string" &&
                row.Servicio.includes("(50%)");

              return (
                <tr
                  key={rowIndex}
                  className={
                    isSummaryRow ? "bg-gray-900/70" : "hover:bg-blue-900/10"
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column}`}
                      className={`px-6 py-4 text-base whitespace-nowrap ${
                        column === "Ganancia"
                          ? "font-semibold text-blue-200"
                          : "text-gray-200"
                      } ${
                        isSummaryRow
                          ? "metallic-3d-text tracking-[0.15em] uppercase"
                          : ""
                      }`}
                    >
                      {row[column] !== undefined && row[column] !== ""
                        ? row[column]
                        : "—"}
                    </td>
                  ))}
                </tr>
              );
            })
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
    </div>
  );
};

export default DataTable;

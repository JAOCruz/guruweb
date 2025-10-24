import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExcelRow } from "../../services/excelService";

interface AdminDataTableProps {
  data: ExcelRow[];
  onSort: (column: string, direction: "asc" | "desc") => void;
}

// User columns in the data
const USER_COLUMNS = ["HENGI", "MARLENI", "ISRAEL", "THAICAR"];

const AdminDataTable: React.FC<AdminDataTableProps> = ({ data, onSort }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeUser, setActiveUser] = useState<string | "all">("all");

  // Group data by user and type (service or earnings)
  const groupDataByUser = () => {
    const groupedData: Record<string, { services: any[]; earnings: any[] }> =
      {};

    // Initialize structure for each user
    USER_COLUMNS.forEach((user) => {
      groupedData[user] = {
        services: [],
        earnings: [],
      };
    });

    // Process data rows
    data.forEach((row) => {
      if (row.DETALLE === "SERVICIO") {
        USER_COLUMNS.forEach((user) => {
          if (row[user] && row[user] !== "") {
            groupedData[user].services.push({
              service: row[user],
              // Look for corresponding earnings in the data
              earnings: findEarningsForService(data, user, row),
            });
          }
        });
      }
    });

    return groupedData;
  };

  // Find earnings for a specific service
  const findEarningsForService = (
    data: ExcelRow[],
    user: string,
    serviceRow: ExcelRow,
  ): number | string => {
    // Find the earnings row that corresponds to this service
    const serviceIndex = data.indexOf(serviceRow);

    // Check if there's a GANANCIA row before or after this service
    if (serviceIndex > 0 && data[serviceIndex - 1].DETALLE === "GANANCIA") {
      return data[serviceIndex - 1][user];
    } else if (
      serviceIndex < data.length - 1 &&
      data[serviceIndex + 1].DETALLE === "GANANCIA"
    ) {
      return data[serviceIndex + 1][user];
    }

    return "";
  };

  // Calculate totals for each user
  const calculateUserTotals = (
    groupedData: Record<string, { services: any[]; earnings: any[] }>,
  ) => {
    const totals: Record<
      string,
      { total: number; adminShare: number; userShare: number }
    > = {};

    USER_COLUMNS.forEach((user) => {
      const userServices = groupedData[user].services;
      let total = 0;

      userServices.forEach((service) => {
        const earnings = Number(service.earnings) || 0;
        total += earnings;
      });

      totals[user] = {
        total,
        adminShare: total * 0.5, // 50% for admin
        userShare: total * 0.5, // 50% for user
      };
    });

    return totals;
  };

  // Calculate admin's total earnings (50% from all users)
  const calculateAdminTotal = (
    userTotals: Record<
      string,
      { total: number; adminShare: number; userShare: number }
    >,
  ) => {
    let adminTotal = 0;

    Object.values(userTotals).forEach((userTotal) => {
      adminTotal += userTotal.adminShare;
    });

    return adminTotal;
  };

  const groupedData = groupDataByUser();
  const userTotals = calculateUserTotals(groupedData);
  const adminTotal = calculateAdminTotal(userTotals);

  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";

    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const handleUserChange = (user: string | "all") => {
    setActiveUser(user);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* User selector tabs */}
      <div className="flex flex-wrap border-b border-blue-900/30">
        <motion.button
          onClick={() => handleUserChange("all")}
          className={`mr-4 border-b-2 px-4 py-2 text-sm font-medium ${
            activeUser === "all"
              ? "border-blue-500"
              : "border-transparent hover:border-gray-300"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className={
              activeUser === "all"
                ? "metallic-3d-text"
                : "text-gray-400 hover:text-gray-300"
            }
          >
            Todos los Usuarios
          </span>
        </motion.button>

        {USER_COLUMNS.map((user) => (
          <motion.button
            key={user}
            onClick={() => handleUserChange(user)}
            className={`mr-4 border-b-2 px-4 py-2 text-sm font-medium ${
              activeUser === user
                ? "border-blue-500"
                : "border-transparent hover:border-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className={
                activeUser === user
                  ? "metallic-3d-text"
                  : "text-gray-400 hover:text-gray-300"
              }
            >
              {user}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Admin summary - always visible */}
      <motion.div
        className="perspective-container rounded-lg border border-blue-700 bg-blue-900/20 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="metallic-3d-text mb-2 text-xl font-semibold">
          Resumen Administrativo
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {USER_COLUMNS.map((user) => (
            <motion.div
              key={user}
              className="rounded-lg border border-gray-700 bg-gray-800/80 p-3 backdrop-blur-sm"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
              }}
            >
              <h4 className="text-md bevel-text font-medium">{user}</h4>
              <p className="text-sm text-gray-300">
                Total:{" "}
                <span className="font-bold text-white">
                  {userTotals[user].total}
                </span>
              </p>
              <p className="text-sm text-gray-300">
                Admin (50%):{" "}
                <span className="font-bold text-green-400">
                  {userTotals[user].adminShare}
                </span>
              </p>
              <p className="text-sm text-gray-300">
                Usuario (50%):{" "}
                <span className="font-bold text-yellow-400">
                  {userTotals[user].userShare}
                </span>
              </p>
            </motion.div>
          ))}
          <motion.div
            className="glow-animation rounded-lg border border-green-700 bg-green-900/20 p-3"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.7)",
            }}
          >
            <h4 className="text-md neon-text font-medium">Total Admin</h4>
            <p className="text-xl font-bold text-white">{adminTotal}</p>
            <p className="text-sm text-gray-300">50% de todos los usuarios</p>
          </motion.div>
        </div>
      </motion.div>

      {/* User data tables */}
      {(activeUser === "all" ? USER_COLUMNS : [activeUser]).map((user) => (
        <motion.div
          key={user}
          className="overflow-hidden rounded-lg border border-blue-900/30 bg-gray-800/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="border-b border-blue-900/30 bg-gray-900/80 px-4 py-3">
            <h3 className="bevel-text text-lg font-medium">{user}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/90">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 bg-gray-800/50">
                {groupedData[user].services.length > 0 ? (
                  groupedData[user].services.map((item, index) => (
                    <motion.tr
                      key={`${user}-service-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      }}
                    >
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                        {item.service}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                        {item.earnings}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-center text-sm text-gray-400"
                    >
                      No hay servicios registrados
                    </td>
                  </tr>
                )}
                {/* Total row */}
                <tr className="bg-gray-900/80">
                  <td className="metallic-3d-text px-6 py-4 text-sm font-bold whitespace-nowrap">
                    Total
                  </td>
                  <td className="metallic-3d-text px-6 py-4 text-sm font-bold whitespace-nowrap">
                    {userTotals[user].total}
                  </td>
                </tr>
                {/* Profit split rows */}
                <tr className="bg-gray-900/50">
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                    Admin (50%)
                  </td>
                  <td className="neon-text px-6 py-4 text-sm font-medium whitespace-nowrap text-green-400">
                    {userTotals[user].adminShare}
                  </td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                    {user} (50%)
                  </td>
                  <td className="neon-text px-6 py-4 text-sm font-medium whitespace-nowrap text-yellow-400">
                    {userTotals[user].userShare}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminDataTable;

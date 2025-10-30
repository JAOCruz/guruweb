import React, { useState } from "react";
import { ExcelRow } from "../../services/excelService";

interface AdminDataTableProps {
  data: ExcelRow[];
  onSort: (column: string, direction: "asc" | "desc") => void; // Kept for API compatibility
}

// User columns in the data
const USER_COLUMNS = ["HENGI", "MARLENI", "ISRAEL", "THAICAR"];

const AdminDataTable: React.FC<AdminDataTableProps> = ({ data }) => {
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

  // Sorting functionality removed as it's not needed in the current implementation

  const handleUserChange = (user: string | "all") => {
    setActiveUser(user);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* User selector tabs */}
      <div className="flex flex-wrap border-b border-blue-900/30">
        <button
          onClick={() => handleUserChange("all")}
          className={`mr-4 border-b-2 px-4 py-2 text-sm font-medium ${
            activeUser === "all"
              ? "border-blue-500"
              : "border-transparent hover:border-gray-300"
          }`}
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
        </button>

        {USER_COLUMNS.map((user) => (
          <button
            key={user}
            onClick={() => handleUserChange(user)}
            className={`mr-4 border-b-2 px-4 py-2 text-sm font-medium ${
              activeUser === user
                ? "border-blue-500"
                : "border-transparent hover:border-gray-300"
            }`}
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
          </button>
        ))}
      </div>

      {/* Admin summary - always visible */}
      <div className="perspective-container rounded-lg border border-blue-700 bg-blue-900/20 p-4">
        <h3 className="metallic-3d-text mb-2 text-xl font-semibold">
          Resumen Administrativo
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {USER_COLUMNS.map((user) => (
            <div
              key={user}
              className="rounded-lg border border-gray-700 bg-gray-800/80 p-3 backdrop-blur-sm"
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
            </div>
          ))}
          <div className="glow-animation rounded-lg border border-green-700 bg-green-900/20 p-3">
            <h4 className="text-md neon-text font-medium">Total Admin</h4>
            <p className="text-xl font-bold text-white">{adminTotal}</p>
            <p className="text-sm text-gray-300">50% de todos los usuarios</p>
          </div>
        </div>
      </div>

      {/* User data tables */}
      {(activeUser === "all" ? USER_COLUMNS : [activeUser]).map((user) => (
        <div
          key={user}
          className="overflow-hidden rounded-lg border border-blue-900/30 bg-gray-800/80 backdrop-blur-sm"
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
                    <tr
                      key={`${user}-service-${index}`}
                      className="hover:bg-blue-900/10"
                    >
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                        {item.service}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                        {item.earnings}
                      </td>
                    </tr>
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
        </div>
      ))}
    </div>
  );
};

export default AdminDataTable;

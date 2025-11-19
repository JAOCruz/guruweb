import React, { useState } from "react";
import { ExcelRow, USER_COLUMNS, WorkerKey } from "../../services/excelService";

interface AdminDataTableProps {
  data: ExcelRow[];
  onSort: (column: string, direction: "asc" | "desc") => void; // Kept for API compatibility
}

interface UserServiceEntry {
  service: string;
  earnings: number;
  client: string;
  time: string;
}

type GroupedUserData = Record<WorkerKey, UserServiceEntry[]>;

const AdminDataTable: React.FC<AdminDataTableProps> = ({ data }) => {
  const [activeUser, setActiveUser] = useState<WorkerKey | "all">("all");

  // Group data by user and type (service or earnings)
  const groupDataByUser = (): GroupedUserData => {
    const groupedData = USER_COLUMNS.reduce<GroupedUserData>((acc, user) => {
      acc[user] = [];
      return acc;
    }, {} as GroupedUserData);

    const findDetailValue = (
      currentIndex: number,
      detailType: string,
      user: WorkerKey,
    ): string | number | undefined => {
      const searchOffsets = [-3, -2, -1, 1, 2, 3];

      for (const offset of searchOffsets) {
        const candidate = data[currentIndex + offset];
        if (candidate && candidate.DETALLE === detailType) {
          return candidate[user];
        }
      }

      return undefined;
    };

    data.forEach((row, index) => {
      if (row.DETALLE !== "SERVICIO") {
        return;
      }

      USER_COLUMNS.forEach((user) => {
        const serviceValue = row[user];
        if (!serviceValue) {
          return;
        }

        const earnings = Number(findDetailValue(index, "GANANCIA", user)) || 0;
        const clientValue = findDetailValue(index, "CLIENTE", user);
        const timeValue = findDetailValue(index, "HORA", user);

        groupedData[user].push({
          service: String(serviceValue),
          earnings,
          client: clientValue ? String(clientValue) : "",
          time: timeValue ? String(timeValue) : "",
        });
      });
    });

    return groupedData;
  };

  // Calculate totals for each user
  const calculateUserTotals = (groupedData: GroupedUserData) => {
    const totals: Record<
      WorkerKey,
      { total: number; adminShare: number; userShare: number }
    > = {} as Record<
      WorkerKey,
      { total: number; adminShare: number; userShare: number }
    >;

    USER_COLUMNS.forEach((user) => {
      const total = groupedData[user].reduce(
        (acc, service) => acc + service.earnings,
        0,
      );

      totals[user] = {
        total,
        adminShare: Number((total * 0.5).toFixed(2)),
        userShare: Number((total * 0.5).toFixed(2)),
      };
    });

    return totals;
  };

  // Calculate admin's total earnings (50% from all users)
  const calculateAdminTotal = (
    userTotals: Record<
      WorkerKey,
      { total: number; adminShare: number; userShare: number }
    >,
  ) => {
    return USER_COLUMNS.reduce((acc, user) => {
      return acc + (userTotals[user]?.adminShare ?? 0);
    }, 0);
  };

  const groupedData = groupDataByUser();
  const userTotals = calculateUserTotals(groupedData);
  const adminTotal = calculateAdminTotal(userTotals);

  // Sorting functionality removed as it's not needed in the current implementation

  const handleUserChange = (userKey: WorkerKey | "all") => {
    setActiveUser(userKey);
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
      {(activeUser === "all" ? USER_COLUMNS : [activeUser]).map(
        (user: WorkerKey) => (
          <div
            key={user}
            className="overflow-hidden rounded-2xl border border-blue-900/30 bg-gray-900/70 shadow-lg backdrop-blur-md"
          >
            <div className="border-b border-blue-900/30 bg-gray-950/80 px-6 py-4">
              <h3 className="metallic-3d-text text-2xl font-semibold tracking-[0.25em] uppercase">
                {user}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800 text-base">
                <thead className="bg-gray-950/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                      Hora
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                      Ganancia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 bg-gray-900/40">
                  {groupedData[user].length > 0 ? (
                    groupedData[user].map(
                      (item: UserServiceEntry, index: number) => (
                        <tr
                          key={`${user}-service-${index}`}
                          className="hover:bg-blue-900/10"
                        >
                          <td className="px-6 py-4 text-base whitespace-nowrap text-gray-200">
                            {item.service}
                          </td>
                          <td className="px-6 py-4 text-base whitespace-nowrap text-gray-200">
                            {item.client || "—"}
                          </td>
                          <td className="px-6 py-4 text-base whitespace-nowrap text-gray-200">
                            {item.time || "—"}
                          </td>
                          <td className="px-6 py-4 text-base font-semibold whitespace-nowrap text-blue-200">
                            {item.earnings}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-base text-gray-400"
                      >
                        No hay servicios registrados
                      </td>
                    </tr>
                  )}
                  {/* Total row */}
                  <tr className="bg-gray-900/80">
                    <td className="metallic-3d-text px-6 py-4 text-base font-bold tracking-[0.2em] whitespace-nowrap">
                      Total
                    </td>
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      —
                    </td>
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      —
                    </td>
                    <td className="metallic-3d-text px-6 py-4 text-base font-bold tracking-[0.2em] whitespace-nowrap">
                      {userTotals[user].total}
                    </td>
                  </tr>
                  {/* Profit split rows */}
                  <tr className="bg-gray-900/50">
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      Admin (50%)
                    </td>
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      —
                    </td>
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      —
                    </td>
                    <td className="neon-text px-6 py-4 text-base font-semibold whitespace-nowrap text-green-400">
                      {userTotals[user].adminShare}
                    </td>
                  </tr>
                  <tr className="bg-gray-900/50">
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      {user} (50%)
                    </td>
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      —
                    </td>
                    <td className="px-6 py-4 text-base whitespace-nowrap text-gray-300">
                      —
                    </td>
                    <td className="neon-text px-6 py-4 text-base font-semibold whitespace-nowrap text-yellow-400">
                      {userTotals[user].userShare}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default AdminDataTable;

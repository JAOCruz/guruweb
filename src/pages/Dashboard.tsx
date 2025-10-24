import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DataTable from "../components/dashboard/DataTable";
import DataCharts from "../components/dashboard/DataCharts";
import AdminDataTable from "../components/dashboard/AdminDataTable";
import DataModificationForm from "../components/dashboard/DataModificationForm";
import { useAuth } from "../context/AuthContext";
import {
  ExcelRow,
  fetchExcelData,
  filterData,
  sortData,
  getSampleData,
  filterDataByUserAccess,
  addServiceAndEarnings,
  calculateUserTotals,
  calculateAdminTotal,
} from "../services/excelService";

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<ExcelRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"table" | "charts">("table");

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, this would be a URL to your Excel file
        // For now, we'll use sample data
        // const data = await fetchExcelData("https://example.com/data.xlsx");

        // Using sample data for development
        const sampleData = getSampleData();

        // Apply user-specific filtering
        const userRole = user?.role || "user";
        const userDataColumn = user?.dataColumn;

        // Store the complete data for admin use
        setData(sampleData);

        // Filter data based on user role and access
        const userFilteredData = filterDataByUserAccess(
          sampleData,
          userRole,
          userDataColumn,
        );
        setFilteredData(userFilteredData);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Error al cargar los datos. Por favor intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Apply search filtering on top of user-filtered data
    const userRole = user?.role || "user";
    const userDataColumn = user?.dataColumn;

    const filtered = filterData(data, term, isAdmin ? null : userDataColumn);
    setFilteredData(filtered);
  };

  // Handle sort
  const handleSort = (column: string, direction: "asc" | "desc") => {
    const sorted = sortData(filteredData, column, direction);
    setFilteredData(sorted);
  };

  // Handle adding new service and earnings
  const handleAddService = (
    user: string,
    service: string,
    earnings: number,
  ) => {
    try {
      // Add the new service and earnings to the data
      const updatedData = addServiceAndEarnings(data, user, service, earnings);
      setData(updatedData);

      // Update filtered data based on user role
      const userRole = user?.role || "user";
      const userDataColumn = user?.dataColumn;

      const updatedFilteredData = filterDataByUserAccess(
        updatedData,
        userRole,
        userDataColumn,
      );
      setFilteredData(updatedFilteredData);

      // Show success message
      alert(`Servicio "${service}" agregado correctamente para ${user}`);
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Error al agregar el servicio. Por favor intente nuevamente.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="text-3xl font-bold text-white">
            {isAdmin ? "Dashboard Administrativo" : `Mis Servicios y Ganancias`}
          </h1>

          <div className="flex items-center gap-4">
            {/* No button needed here anymore, form component will handle this */}

            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Buscar..."
                className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pr-4 pl-10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("table")}
              className={`mr-8 border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "table"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
              }`}
            >
              Tabla de Datos
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`mr-8 border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "charts"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
              }`}
            >
              Gráficos
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-blue-500"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-300">
              {error}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="rounded-lg bg-gray-700/30 p-8 text-center text-gray-400">
              No se encontraron resultados para "{searchTerm}"
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isAdmin ? (
                // Admin view with specialized components
                <>
                  {/* Data modification form for admin */}
                  <DataModificationForm onAddService={handleAddService} />

                  {/* Admin data table or charts */}
                  {activeTab === "table" ? (
                    <AdminDataTable data={data} onSort={handleSort} />
                  ) : (
                    <DataCharts data={data} />
                  )}
                </>
              ) : // Regular user view
              activeTab === "table" ? (
                <DataTable data={filteredData} onSort={handleSort} />
              ) : (
                <DataCharts data={filteredData} />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

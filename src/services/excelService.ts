import * as XLSX from "xlsx";

// Define types for our Excel data
export interface ExcelRow {
  HENGI: string | number;
  MARLENI: string | number;
  ISRAEL: string | number;
  THAICAR: string | number;
  [key: string]: any; // For any additional columns
}

// Cache mechanism
const cache: {
  data: ExcelRow[] | null;
  timestamp: number | null;
} = {
  data: null,
  timestamp: null,
};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Fetch Excel data from a cloud storage URL
 */
export const fetchExcelData = async (url: string): Promise<ExcelRow[]> => {
  // Check if we have valid cached data
  const now = Date.now();
  if (
    cache.data &&
    cache.timestamp &&
    now - cache.timestamp < CACHE_EXPIRATION
  ) {
    return cache.data;
  }

  try {
    // Fetch the Excel file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
    }

    // Get the file as array buffer
    const arrayBuffer = await response.arrayBuffer();

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // Assume first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    // Update cache
    cache.data = data;
    cache.timestamp = now;

    return data;
  } catch (error) {
    console.error("Error fetching or parsing Excel data:", error);
    throw error;
  }
};

/**
 * Get column names from Excel data
 */
export const getColumnNames = (data: ExcelRow[]): string[] => {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
};

/**
 * Filter Excel data based on search term
 */
export const filterData = (
  data: ExcelRow[],
  searchTerm: string,
  userDataColumn?: string | null,
): ExcelRow[] => {
  // First, filter by user access if applicable
  let filteredData = data;

  // If userDataColumn is provided, filter the data to only include relevant columns
  if (userDataColumn) {
    filteredData = data.map((row) => {
      // Create a new object with only the columns the user should see
      const filteredRow: ExcelRow = {};

      // Always include common columns that all users should see
      Object.keys(row).forEach((key) => {
        // Include the user's specific column and any non-user columns
        if (
          key === userDataColumn ||
          !["HENGI", "MARLENI", "ISRAEL", "THAICAR"].includes(key)
        ) {
          filteredRow[key] = row[key];
        }
      });

      return filteredRow;
    });
  }

  // Then apply search term filtering if provided
  if (!searchTerm) return filteredData;

  const lowercasedTerm = searchTerm.toLowerCase();

  return filteredData.filter((row) => {
    return Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowercasedTerm);
    });
  });
};

/**
 * Sort Excel data by column
 */
export const sortData = (
  data: ExcelRow[],
  sortColumn: string,
  sortDirection: "asc" | "desc",
): ExcelRow[] => {
  return [...data].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    // Handle numeric values
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }

    // Handle string values
    const stringA = String(valueA).toLowerCase();
    const stringB = String(valueB).toLowerCase();

    if (stringA < stringB) return sortDirection === "asc" ? -1 : 1;
    if (stringA > stringB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Filter data based on user role and access
 */
export const filterDataByUserAccess = (
  data: ExcelRow[],
  userRole: string,
  userDataColumn?: string | null,
): ExcelRow[] => {
  // Admin can see all data
  if (userRole === "admin") {
    return data;
  }

  // Regular users can only see their own data in a simplified format
  if (userRole === "user" && userDataColumn) {
    // Create a new array with restructured data
    const userRows: ExcelRow[] = [];

    // Group by pairs of SERVICIO and GANANCIA
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Skip empty rows for this user
      if (row[userDataColumn] === "" || row[userDataColumn] === undefined) {
        continue;
      }

      // Check if this is a service row
      if (row.DETALLE === "SERVICIO") {
        const serviceValue = row[userDataColumn];
        let gainValue = "";

        // Look for the corresponding GANANCIA row
        if (i > 0 && data[i - 1].DETALLE === "GANANCIA") {
          gainValue = data[i - 1][userDataColumn];
        } else if (i < data.length - 1 && data[i + 1].DETALLE === "GANANCIA") {
          gainValue = data[i + 1][userDataColumn];
        }

        // Create a new row with Servicio and Ganancia columns
        const newRow: ExcelRow = {
          HENGI: "",
          MARLENI: "",
          ISRAEL: "",
          THAICAR: "",
          Servicio: serviceValue,
          Ganancia: gainValue,
        };

        userRows.push(newRow);
      } else if (row.DETALLE === "TOTAL" || row.DETALLE === "%") {
        // Include totals and percentages
        const newRow: ExcelRow = {
          HENGI: "",
          MARLENI: "",
          ISRAEL: "",
          THAICAR: "",
          DETALLE: row.DETALLE,
          Valor: row[userDataColumn],
        };

        userRows.push(newRow);
      }
    }

    return userRows;
  }

  // Default fallback
  return data;
};

/**
 * Calculate user totals and profit splits
 */
export const calculateUserTotals = (data: ExcelRow[]) => {
  const userColumns = ["HENGI", "MARLENI", "ISRAEL", "THAICAR"];
  const totals: Record<
    string,
    { total: number; adminShare: number; userShare: number }
  > = {};

  // Initialize totals
  userColumns.forEach((user) => {
    totals[user] = {
      total: 0,
      adminShare: 0,
      userShare: 0,
    };
  });

  // Find total rows
  const totalRow = data.find((row) => row.DETALLE === "TOTAL");

  if (totalRow) {
    userColumns.forEach((user) => {
      const total = Number(totalRow[user]) || 0;
      totals[user] = {
        total,
        adminShare: total * 0.5, // 50% for admin
        userShare: total * 0.5, // 50% for user
      };
    });
  } else {
    // If no total row, calculate from individual entries
    data.forEach((row) => {
      if (row.DETALLE === "GANANCIA") {
        userColumns.forEach((user) => {
          const value = Number(row[user]) || 0;
          totals[user].total += value;
        });
      }
    });

    // Calculate shares
    userColumns.forEach((user) => {
      totals[user].adminShare = totals[user].total * 0.5;
      totals[user].userShare = totals[user].total * 0.5;
    });
  }

  return totals;
};

/**
 * Calculate admin's total earnings from all users
 */
export const calculateAdminTotal = (
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

/**
 * Add a new service and earnings to the data
 */
export const addServiceAndEarnings = (
  data: ExcelRow[],
  user: string,
  service: string,
  earnings: number,
): ExcelRow[] => {
  // Create a copy of the data
  const newData = [...data];

  // Create new rows for the service and earnings
  const serviceRow: ExcelRow = {
    HENGI: "",
    MARLENI: "",
    ISRAEL: "",
    THAICAR: "",
    DETALLE: "SERVICIO",
  };
  serviceRow[user] = service;

  const earningsRow: ExcelRow = {
    HENGI: "",
    MARLENI: "",
    ISRAEL: "",
    THAICAR: "",
    DETALLE: "GANANCIA",
  };
  earningsRow[user] = earnings;

  // Find the last service/earnings pair
  let insertIndex = newData.length - 3; // Default to before TOTAL and % rows
  for (let i = newData.length - 1; i >= 0; i--) {
    if (
      newData[i].DETALLE === "SERVICIO" ||
      newData[i].DETALLE === "GANANCIA"
    ) {
      insertIndex = i + 1;
      break;
    }
  }

  // Insert the new rows
  newData.splice(insertIndex, 0, earningsRow, serviceRow);

  // Update totals
  const userColumns = ["HENGI", "MARLENI", "ISRAEL", "THAICAR"];
  const totalRow = newData.find((row) => row.DETALLE === "TOTAL");
  const percentRow = newData.find((row) => row.DETALLE === "%");

  if (totalRow) {
    const currentTotal = Number(totalRow[user]) || 0;
    totalRow[user] = currentTotal + earnings;

    if (percentRow) {
      // Update the percentage row if needed (keeping it at 50%)
      percentRow[user] = "50.%";
    }
  }

  return newData;
};

/**
 * Get sample data for development
 */
export const getSampleData = (): ExcelRow[] => {
  return [
    { DETALLE: "GANANCIA", HENGI: 80, MARLENI: 200, ISRAEL: 100, THAICAR: 500 },
    {
      DETALLE: "SERVICIO",
      HENGI: "IMPRESION SEÑOR",
      MARLENI: "DIGITACION DIONICIO",
      ISRAEL: "IMPRESION DANILO",
      THAICAR: "BONO ENTRENAMIENTO",
    },
    {
      DETALLE: "GANANCIA",
      HENGI: 500,
      MARLENI: 500,
      ISRAEL: 500,
      THAICAR: 200,
    },
    {
      DETALLE: "SERVICIO",
      HENGI: "TRADUCCION SEÑOR",
      MARLENI: "DOCUMENTO GREY",
      ISRAEL: "MATRICULA EDITABLE",
      THAICAR: "CV DEL ING. JOHNNY",
    },
    { DETALLE: "GANANCIA", HENGI: 20, MARLENI: "", ISRAEL: 150, THAICAR: "" },
    {
      DETALLE: "SERVICIO",
      HENGI: "",
      MARLENI: "",
      ISRAEL: "INSTANCIA ING. JOHNNY",
      THAICAR: "",
    },
    { DETALLE: "GANANCIA", HENGI: "", MARLENI: "", ISRAEL: 1000, THAICAR: "" },
    {
      DETALLE: "SERVICIO",
      HENGI: "",
      MARLENI: "",
      ISRAEL: "SEÑOR BERNARDO",
      THAICAR: "",
    },
    { DETALLE: "GANANCIA", HENGI: "", MARLENI: "", ISRAEL: 200, THAICAR: "" },
    {
      DETALLE: "SERVICIO",
      HENGI: "",
      MARLENI: "",
      ISRAEL: "SEÑOR JACINTO",
      THAICAR: "",
    },
    { DETALLE: "GANANCIA", HENGI: "", MARLENI: 100, ISRAEL: 650, THAICAR: 100 },
    {
      DETALLE: "SERVICIO",
      HENGI: "",
      MARLENI: "",
      ISRAEL: "INSTALACION MICROSOFT WORD",
      THAICAR: "COMPLETIVO",
    },
    { DETALLE: "TOTAL", HENGI: 600, MARLENI: 700, ISRAEL: 1950, THAICAR: 700 },
    {
      DETALLE: "GANANCIA",
      HENGI: 300,
      MARLENI: 350,
      ISRAEL: 975,
      THAICAR: 350,
    },
    {
      DETALLE: "%",
      HENGI: "50.%",
      MARLENI: "50.%",
      ISRAEL: "50.%",
      THAICAR: "50.%",
    },
  ];
};

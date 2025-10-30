import React, { useState } from "react";

interface DataModificationFormProps {
  onAddService: (user: string, service: string, earnings: number) => void;
}

// User columns in the data
const USER_COLUMNS = ["HENGI", "MARLENI", "ISRAEL", "THAICAR"];

const DataModificationForm: React.FC<DataModificationFormProps> = ({
  onAddService,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>(USER_COLUMNS[0]);
  const [serviceName, setServiceName] = useState<string>("");
  const [earnings, setEarnings] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!serviceName.trim()) {
      setError("Por favor ingrese el nombre del servicio");
      return;
    }

    const earningsNum = Number(earnings);
    if (isNaN(earningsNum) || earningsNum <= 0) {
      setError("Por favor ingrese una ganancia válida");
      return;
    }

    // Submit the data
    onAddService(selectedUser, serviceName, earningsNum);

    // Reset form
    setServiceName("");
    setEarnings("");
    setIsFormOpen(false);
  };

  return (
    <div className="perspective-container overflow-hidden rounded-lg border border-blue-900/30 bg-gray-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-blue-900/30 bg-gray-900/80 px-4 py-3">
        <h3 className="metallic-3d-text text-lg font-medium">
          Modificar Datos
        </h3>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="rounded-lg border border-blue-900/30 bg-blue-600/20 px-4 py-2 text-sm text-blue-300 hover:bg-blue-600/30"
        >
          {isFormOpen ? "Cancelar" : "Agregar Servicio"}
        </button>
      </div>

      {isFormOpen && (
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-900/30 bg-red-500/20 p-3 text-center text-red-300">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="user"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Usuario
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {USER_COLUMNS.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="service"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Nombre del Servicio
              </label>
              <input
                type="text"
                id="service"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Traducción de Documento"
              />
            </div>

            <div>
              <label
                htmlFor="earnings"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Ganancia
              </label>
              <input
                type="number"
                id="earnings"
                value={earnings}
                onChange={(e) => setEarnings(e.target.value)}
                className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: 500"
                min="0"
                step="1"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg border border-green-900/30 bg-green-600/20 px-6 py-2.5 text-sm font-medium text-green-300 hover:bg-green-600/30"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DataModificationForm;

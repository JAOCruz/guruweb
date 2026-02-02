import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  PieChart, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronRight,
  User
} from "lucide-react"; // Asegúrate de tener lucide-react instalado

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold text-white">G</span>
          </div>
          <span className={`ml-3 font-bold text-lg text-white transition-opacity duration-300 ${!isSidebarOpen && "opacity-0 hidden"}`}>
            Gurú<span className="text-blue-500">Admin</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" isOpen={isSidebarOpen} />
          <NavItem to="/dashboard/charts" icon={<PieChart size={20} />} label="Gráficos" isOpen={isSidebarOpen} />
          {isAdmin && (
             <NavItem to="/dashboard/settings" icon={<Settings size={20} />} label="Configuración" isOpen={isSidebarOpen} />
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
           <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 transition-all ${!isSidebarOpen && "justify-center"}`}>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                 {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              {isSidebarOpen && (
                <div className="min-w-0 overflow-hidden">
                   <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                   <button onClick={logout} className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                      <LogOut size={12}/> Cerrar sesión
                   </button>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                 <Menu size={20} />
              </button>
              <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                 <span className="text-slate-500">Panel</span>
                 <ChevronRight size={14} />
                 <span className="text-slate-200">{isAdmin ? "Administración" : "Empleado"}</span>
              </h2>
           </div>
           
           <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 font-medium">
                 {user?.dataColumn || "General"}
              </span>
           </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-x-hidden">
           {children}
        </main>
      </div>
    </div>
  );
};

// Helper Component for Links
const NavItem = ({ to, icon, label, isOpen }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
      ${isActive 
        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm" 
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}
      ${!isOpen && "justify-center px-2"}
    `}
  >
    {icon}
    {isOpen && <span className="font-medium text-sm">{label}</span>}
  </NavLink>
);

export default DashboardLayout;
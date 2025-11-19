import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      setError("Por favor ingrese usuario y contraseña");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, password, rememberMe);
      if (!success) {
        setError("Usuario o contraseña incorrectos");
      } else {
        // Use React Router's navigate function instead of window.location
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intente nuevamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, 
            rgba(0, 0, 0, 0.8), 
            rgba(30, 58, 130, 0.8), 
            rgba(0, 0, 0, 0.8)
          ),
          url('/background.jpeg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-xl border border-blue-500 bg-black/40 p-8 backdrop-blur-sm"
      >
        <div className="mb-8 text-center">
          <h2 className="section-title-neon mb-2 text-3xl font-bold">
            ¿Trabajas Con Nosotros?
          </h2>
          <p className="text-gray-300">Ingrese sus credenciales para acceder</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-md bg-red-500/20 p-3 text-center text-red-300"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Ingrese su usuario"
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Ingrese su contraseña"
            />
          </div>

          <div className="mb-6 flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-gray-700 bg-gray-900/50 text-blue-500 focus:ring-blue-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Recordarme
            </label>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg border-2 border-blue-500 bg-blue-500/20 px-6 py-3 font-semibold text-white transition hover:bg-blue-500/40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-blue-400 transition hover:text-blue-300"
          >
            Volver al sitio principal
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

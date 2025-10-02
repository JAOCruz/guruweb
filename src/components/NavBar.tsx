import React from "react";
import { motion } from "framer-motion";

const NavBar: React.FC = () => {
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      color: "#ffffff",
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.nav
      className="flex items-center justify-between px-8 py-6"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <motion.div
        className="flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="text-2xl font-bold text-white">
          GURÚ
          <div className="text-xs tracking-widest">SOLUCIONES</div>
        </div>
      </motion.div>

      <div className="flex items-center gap-8">
        <motion.a
          href="#"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          Inicio
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          Servicios
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          Sobre Nosotros
        </motion.a>
        <motion.a
          href="https://wa.me/18298049017"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border-2 border-blue-500 px-6 py-2 text-white transition hover:bg-blue-500"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Contáctanos
        </motion.a>
      </div>
    </motion.nav>
  );
};

export default NavBar;

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const arrowVariants = {
    hover: {
      x: 5,
      transition: { repeat: Infinity, repeatType: "reverse", duration: 0.6 },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-8 py-20 text-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="mb-6 text-6xl leading-tight font-bold text-white md:text-7xl"
        variants={itemVariants}
      >
        Una Experiencia
        <br />
        legal Inteligente
      </motion.h1>

      <motion.p className="mb-12 text-xl text-gray-300" variants={itemVariants}>
        Tus documentos en manos de expertos
      </motion.p>

      <motion.button
        className="group inline-flex items-center gap-3 rounded-lg border-2 border-blue-500 bg-transparent px-6 py-3 text-white transition hover:bg-blue-500"
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.div
          variants={arrowVariants}
          className="transition group-hover:translate-x-1"
        >
          <ArrowRight className="h-5 w-5" />
        </motion.div>
        <span className="text-lg">Descubre más</span>
      </motion.button>
    </motion.div>
  );
};

export default HeroSection;

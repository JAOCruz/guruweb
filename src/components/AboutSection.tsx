import React from "react";
import { motion } from "framer-motion";

const AboutSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
        when: "beforeChildren",
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

  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: [0, 1.2, 1],
      transition: { duration: 0.8, times: [0, 0.6, 1] },
    },
  };

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.div
      className="px-8 py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          className="mb-8 flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <motion.div
            className="h-2 w-2 rounded-full bg-blue-400"
            variants={dotVariants}
            animate={pulseAnimation}
          ></motion.div>
          <span className="text-sm tracking-wider text-gray-400">
            Conócenos
          </span>
        </motion.div>

        <motion.h2
          className="mb-12 text-5xl font-bold text-white"
          variants={itemVariants}
        >
          ¿Quienes Somos?
        </motion.h2>

        <motion.p
          className="text-lg leading-relaxed text-gray-300"
          variants={itemVariants}
        >
          Somos expertos en digitación de documentos legales, nuestra misión es
          simplificar procesos complejos para tu tranquilidad, ofreciendo
          siempre soluciones ágiles y de calidad.{" "}
          <span className="font-semibold text-white">Gurú Soluciones</span> es
          tu socio estratégico para garantizar resultados impecables.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AboutSection;

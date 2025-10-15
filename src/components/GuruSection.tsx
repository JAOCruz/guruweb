import React from "react";
import { motion } from "framer-motion";

const GuruSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
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
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  };

  return (
    <motion.div
      className="px-8 py-20"
      id="sobre-guru"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center">
          {/* Section Title */}
          <motion.div
            className="mb-12 flex flex-col items-center"
            variants={itemVariants}
          ></motion.div>

          {/* First Row */}
          <div className="mb-16 grid items-center gap-8 md:grid-cols-2">
            <motion.div
              className="order-2 flex flex-col space-y-6 md:order-1"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                El Búho de la Sabiduría Legal
              </h3>
              <p className="text-lg leading-relaxed text-gray-300">
                Nuestro Gurú, representado por un búho con lentes, simboliza la
                sabiduría y atención al detalle que caracteriza nuestros
                servicios. Con su mirada aguda y preparación impecable, nuestro
                mascota personifica los valores de excelencia y profesionalismo
                que ofrecemos en cada documento legal que procesamos.
              </p>
            </motion.div>
            <motion.div
              className="order-1 flex justify-center md:order-2"
              variants={imageVariants}
            >
              <img
                src="/mascot_1.png"
                alt="Gurú Búho con Documentos"
                className="max-h-[300px] w-auto rounded-lg object-contain"
              />
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid items-center gap-8 md:grid-cols-2">
            <motion.div
              className="flex justify-center"
              variants={imageVariants}
            >
              <img
                src="/mascot_2.png"
                alt="Gurú Búho Leyendo"
                className="max-h-[300px] w-auto rounded-lg object-contain"
              />
            </motion.div>
            <motion.div
              className="flex flex-col space-y-6"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                Compromiso con la Precisión
              </h3>
              <p className="text-lg leading-relaxed text-gray-300">
                Así como nuestro búho lee cuidadosamente cada documento, en Gurú
                Soluciones revisamos meticulosamente cada detalle para
                garantizar la exactitud y calidad de nuestro trabajo. Nuestro
                compromiso es brindar tranquilidad a nuestros clientes, sabiendo
                que sus documentos legales están en las mejores manos.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuruSection;

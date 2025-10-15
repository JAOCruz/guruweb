import React, { useState, useRef } from "react";
import { motion, easeOut, useMotionValue, useSpring } from "framer-motion";

const DominicanSection: React.FC = () => {
  // Mouse position tracking for tilt effect
  const mapRef = useRef<HTMLDivElement>(null);
  const [mouseEntered, setMouseEntered] = useState(false);

  // Motion values for tilt effect
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring animations for smooth transitions
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  // We'll use transform values directly in the JSX

  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the center of the element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center (normalized to -1 to 1)
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);

    // Apply rotation based on mouse position (inverted for natural feel)
    rotateX.set(-distanceY * 15); // Limit rotation to 15 degrees
    rotateY.set(distanceX * 15);
  };

  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setMouseEntered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  // Set entered state when mouse enters
  const handleMouseEnter = () => {
    setMouseEntered(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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
      },
    },
  };

  const mapVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      className="px-8 py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center gap-12 md:flex-row">
          {/* Map with 3D effect */}
          <motion.div
            ref={mapRef}
            className="perspective-container relative w-full max-w-md"
            variants={mapVariants}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              className="relative"
              style={{
                height: "300px",
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
                filter: mouseEntered
                  ? "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.4))"
                  : "drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))",
                z: 100, // Push forward in 3D space
              }}
            >
              {/* Simply display the pre-beveled image */}
              <motion.img
                src="/rd_3d.png"
                alt="Mapa de República Dominicana"
                className="h-full w-auto object-contain"
                style={{
                  filter: "brightness(1.05)",
                  transformStyle: "preserve-3d",
                  z: 50,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Text content */}
          <motion.div
            className="flex flex-col items-center text-center md:items-start md:text-left"
            variants={itemVariants}
          >
            <h2 className="section-title-neon mb-6 text-3xl font-bold md:text-4xl">
              Basados en República Dominicana
            </h2>
            <p className="mb-4 text-lg text-gray-300">
              Orgullosamente dominicanos, ofrecemos nuestros servicios legales y
              documentales con la calidez y profesionalismo que nos caracteriza.
            </p>
            <p className="text-lg text-gray-300">
              Ubicados estratégicamente en Santo Domingo, atendemos clientes en
              toda la isla y brindamos soluciones eficientes para todas tus
              necesidades documentales.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DominicanSection;

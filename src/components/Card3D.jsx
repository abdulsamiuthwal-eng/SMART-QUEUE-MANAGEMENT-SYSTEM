import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export const Card3D = ({ children, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
};

export default Card3D;

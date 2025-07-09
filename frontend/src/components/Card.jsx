import { motion } from "framer-motion";

export const Card = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white/80 backdrop-blur-xl border border-gray-200 p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer"
    {...props}
  >
    {children}
  </motion.div>
);
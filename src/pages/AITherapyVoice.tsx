import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LiveSession from "@/components/LiveSession";

const AITherapyVoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <section className="py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LiveSession onBack={() => navigate("/ai-therapy")} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AITherapyVoice;

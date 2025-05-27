import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const verses = [
  "凡事都有定期，天下萬務都有定時。 — 傳道書 3:1",
  "你要專心仰賴耶和華，不可倚靠自己的聰明。 — 箴言 3:5",
  "耶和華是我的牧者，我必不致缺乏。 — 詩篇 23:1",
];

export default function BibleVerseLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % verses.length);
    }, 2000); // 每 2.5 秒切換

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-xl font-semibold text-gray-700 px-6"
        >
          {verses[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

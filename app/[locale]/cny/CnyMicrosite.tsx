"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FRAME_NUMBERS = [
  69, 71, 75, 79, 82, 104, 116, 121, 122, 134, 141, 142, 144, 147, 152, 161, 
  162, 165, 181, 183, 184, 185, 192, 194, 197, 199, 204, 218, 228
];

// Coordinate mapping to hide the baked-in cursor
const CURSOR_PATH = FRAME_NUMBERS.map(() => [99, 50]); 

type CnyParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
};

function createCnyParticle(): CnyParticle {
  const colors = ["#fbc02d", "#d32f2f", "#ffffff", "#ff8a80"];
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: (Math.random() - 0.5) * 15,
    vy: (Math.random() - 0.5) * 15 - 5,
    size: Math.random() * 6 + 2,
    life: 100,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

export default function CnyMicrosite({ locale: _locale }: { locale: string }) {
  const [activePanel, setActivePanel] = useState<"none" | "help" | "send" | "success">("none");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [animationFinished, setPhase] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [formData, setFormData] = useState({
    sender_name: "",
    sender_email: "",
    r_name_1: "",
    r_email_1: "",
    msg: ""
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Initial Loader & Animation Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      startAnimation();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Frame Animation Logic (Autoplay)
  const startAnimation = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < FRAME_NUMBERS.length - 1) {
        index++;
        setCurrentFrameIndex(index);
      } else {
        clearInterval(interval);
        setPhase(true); // Open state reached
      }
    }, 80); // ~12fps for that old-school stop-motion feel
  };

  // 3. Particle System (Triggers at end)
  useEffect(() => {
    if (!animationFinished || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const burstCount = 80;
    const particles: CnyParticle[] = Array.from({ length: burstCount }, () =>
      createCnyParticle(),
    );

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.25;
        particle.life -= 0.8;

        ctx.globalAlpha = particle.life / 100;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }
      animationId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [animationFinished]);

  const replay = () => {
    setCurrentFrameIndex(0);
    setPhase(false);
    startAnimation();
  };

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sender_name || !formData.sender_email || !formData.r_name_1 || !formData.r_email_1) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(formData.sender_email) || !validateEmail(formData.r_email_1)) {
      alert("Please enter valid email addresses.");
      return;
    }
    setRecipientEmail(formData.r_email_1);
    setActivePanel("success");
  };

  return (
    <div className="fixed inset-0 bg-[#ffa9a9] text-[#333] font-sans overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Decorative Branding Layers */}
      <div className="absolute top-[2%] left-0 w-full h-[4em] z-[100] px-[2%] pointer-events-none flex justify-between items-center opacity-60">
        <div className="w-[10em] h-full bg-[url('/img/hey.png')] bg-contain bg-left bg-no-repeat" />
        <div className="w-[15em] h-full bg-[url('/img/wkcdLogo.png')] bg-contain bg-center bg-no-repeat" />
        <div className="w-[10em] h-full bg-[url('/img/goat.png')] bg-contain bg-right bg-no-repeat" />
      </div>

      <div className="absolute bottom-[2%] left-0 w-full h-[4em] z-[100] px-[2%] pointer-events-none flex justify-between items-center opacity-60">
        <div className="w-[10em] h-full bg-[url('/img/hei.png')] bg-contain bg-left bg-no-repeat" />
        <div className="w-[15em] h-full bg-[url('/img/footer.png')] bg-contain bg-center bg-no-repeat" />
        <div className="w-[10em] h-full bg-[url('/img/goat.png')] bg-contain bg-right bg-no-repeat" />
      </div>

      {/* Action Buttons */}
      <div className="fixed top-16 right-[10%] flex flex-col gap-4 z-[30]">
        <div 
          className={`w-8 h-8 cursor-pointer bg-[url('/img/bgm.png')] bg-contain bg-no-repeat ${!isPlaying ? 'opacity-30' : 'opacity-100'}`}
          onClick={() => setIsPlaying(!isPlaying)}
        />
        <div 
          className="w-8 h-[8em] cursor-pointer bg-[url('/img/insturction.png')] bg-contain bg-no-repeat"
          onClick={() => setActivePanel("help")}
        />
      </div>

      {/* Splash Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#ffa9a9] flex flex-col items-center justify-center"
          >
            <div className="w-[300px] h-[300px] bg-[url('/img/wkcdcny_instructionDesktop.gif')] bg-contain bg-center bg-no-repeat mb-4" />
            <div className="w-[200px] h-[2px] bg-white/20 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE MAIN STAGE (Frame Player) */}
      <div className="relative w-full h-full flex flex-col items-center justify-center pt-[4em] pb-[6em]">
        <div className="relative w-[80%] max-w-[800px] aspect-[4/3] flex items-center justify-center">
          {FRAME_NUMBERS.map((num, idx) => (
            <img
              key={num}
              src={`/animations/cny-sequence/frame_${num.toString().padStart(4, "0")}.png`}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-75 pointer-events-none ${
                idx === currentFrameIndex ? "opacity-100" : "opacity-0"
              }`}
              alt={`Frame ${num}`}
            />
          ))}

          {/* Dynamic Patch to hide baked-in cursor */}
          {!animationFinished && (
            <div 
              className="absolute w-12 h-12 bg-[#ffa9a9] blur-md pointer-events-none z-30"
              style={{ 
                left: `${CURSOR_PATH[currentFrameIndex]?.[0] ?? 0}%`, 
                top: `${CURSOR_PATH[currentFrameIndex]?.[1] ?? 0}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
          
          {/* Share Button (appears when finished) */}
          <motion.div 
            animate={{ opacity: animationFinished ? 1 : 0, scale: animationFinished ? 1 : 0.8 }}
            className="absolute bottom-4 z-[20] w-[200px] h-12 bg-[url('/img/shareBut.png')] bg-contain bg-center bg-no-repeat hover:scale-105 transition-transform"
            onClick={() => setActivePanel("send")}
          />
        </div>

        {/* Replay Button */}
        <motion.button
          animate={{ opacity: animationFinished ? 0.6 : 0 }}
          onClick={replay}
          className="mt-4 text-white text-xs underline tracking-widest hover:text-[#fbc02d] transition-colors"
        >
          ↺ Replay Animation
        </motion.button>
      </div>

      {/* PANEL SYSTEM (SEND / HELP / SUCCESS) */}
      <AnimatePresence>
        {activePanel === "send" && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.6 }}
            className="fixed inset-0 z-[120] bg-[#ffa9a9] flex flex-col items-center justify-center"
          >
            <div 
              className="absolute top-16 right-[10%] w-8 h-8 cursor-pointer bg-[url('/img/cancel.png')] bg-contain bg-no-repeat"
              onClick={() => setActivePanel("none")}
            />
            <div className="w-[80%] max-w-[450px] space-y-6 text-center">
              <div className="h-[4em] bg-[url('/img/sharePageTitle.png')] bg-contain bg-center bg-no-repeat" />
              <form onSubmit={handleSend} className="space-y-3">
                <InputBox placeholder="Sender’s Name / 發送人名稱" value={formData.sender_name} onChange={(v) => setFormData({...formData, sender_name: v})} />
                <InputBox placeholder="Sender’s Email / 發送人電郵" value={formData.sender_email} onChange={(v) => setFormData({...formData, sender_email: v})} />
                <InputBox placeholder="Recipient’s Name / 收件人" value={formData.r_name_1} onChange={(v) => setFormData({...formData, r_name_1: v})} />
                <InputBox placeholder="Recipient's Email / 收件人電郵" value={formData.r_email_1} onChange={(v) => setFormData({...formData, r_email_1: v})} />
                <InputBox placeholder="Message / 祝賀語" value={formData.msg} onChange={(v) => setFormData({...formData, msg: v})} />
                <button type="submit" className="w-full h-[4em] bg-[url('/img/sharePageSendBut.png')] bg-contain bg-center bg-no-repeat border-none mt-4 cursor-pointer" />
              </form>
            </div>
          </motion.div>
        )}

        {activePanel === "help" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePanel("none")}
            className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-12 cursor-pointer"
          >
            <div className="w-full h-full bg-[url('/img/insturctionDesktop.png')] bg-contain bg-center bg-no-repeat" />
          </motion.div>
        )}

        {activePanel === "success" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePanel("none")}
            className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer p-8"
          >
            <div className="w-full max-w-[400px] aspect-square bg-[url('/img/messageSentBox.png')] bg-contain bg-center bg-no-repeat flex flex-col items-center justify-center pt-[80px]">
              <span className="text-[#d32f2f] font-bold text-lg">{recipientEmail}</span>
              <p className="text-stone-500 text-xs mt-2 uppercase tracking-tighter">Greeting Sent!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputBox({ placeholder, value, onChange }: { placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="w-full h-[3.2em] bg-[url('/img/sharePageTextField.png')] bg-contain bg-center bg-no-repeat flex items-center px-6">
      <input 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none outline-none text-center text-sm placeholder:text-stone-400"
      />
    </div>
  );
}

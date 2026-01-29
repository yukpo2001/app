import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Shield,
  Satellite,
  Wallet,
  Brain,
  Zap,
  Star,
  Download,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Sparkles,
  Gamepad2,
  Menu,
  X,
  Github
} from 'lucide-react';

// --- Sub-Components ---

const FeaturePot = ({ icon: Icon, title, color, percent, spent = 0, total = 0 }) => {
  console.log(`Rendering Pot: ${title}`);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative flex-1 min-w-[140px] h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group"
    >
      <div
        className="absolute bottom-0 w-full transition-all duration-1000 opacity-30"
        style={{ height: `${percent}%`, backgroundColor: color }}
      />
      <div className="absolute inset-0 p-3 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          {Icon && <Icon size={18} style={{ color }} />}
          <span className="text-[10px] font-black text-white/40">{percent}%</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-white mb-0.5 truncate">{title || 'Untitled'}</h4>
          <p className="text-[10px] text-gray-400 font-mono">₩{(spent || 0).toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

const NeuroSwitchMiniGame = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let animId;
    let startTime;
    const DUR = phase === 'hold' ? 2000 : 4000;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const p = Math.min(elapsed / DUR, 1);

      setProgress(phase === 'exhale' ? 1 - p : p);

      if (p >= 1) {
        startTime = null;
        if (phase === 'inhale') setPhase('hold');
        else if (phase === 'hold') setPhase('exhale');
        else {
          if (cycle < 1) { setCycle(c => c + 1); setPhase('inhale'); }
          else { onComplete(); setIsPlaying(false); }
        }
      }
      animId = requestAnimationFrame(animate);
    };

    if (isPlaying) animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, phase, cycle]);

  const size = 60 + (progress * 60);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 h-full relative overflow-hidden">
      {!isPlaying ? (
        <div className="text-center z-10">
          <Brain className="w-12 h-12 text-neon-magenta mx-auto mb-4" />
          <h3 className="text-lg font-black mb-4">NEURO-SWITCH</h3>
          <button
            onClick={() => { setIsPlaying(true); setPhase('inhale'); setCycle(0); }}
            className="px-6 py-3 bg-neon-magenta rounded-xl font-black text-sm shadow-lg shadow-neon-magenta/20 active:scale-95 transition-all"
          >
            충동 방어 시작
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center w-32 h-32">
            <div className="absolute rounded-full bg-neon-cyan/20 blur-xl" style={{ width: size, height: size }} />
            <div className="rounded-full border-2 border-neon-cyan flex items-center justify-center z-10" style={{ width: size, height: size }}>
              <span className="text-xl font-black text-white">{phase === 'inhale' ? 'IN' : phase === 'hold' ? 'WAIT' : 'OUT'}</span>
            </div>
          </div>
          <p className="mt-8 text-[10px] font-black text-neon-cyan tracking-[0.2em] uppercase">호흡에 집중하세요</p>
        </div>
      )}
    </div>
  );
};

const LandingPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="h-screen w-full bg-space-dark text-white overflow-hidden flex flex-col relative py-6 md:py-8">
      <div className="stars-bg opacity-20" />

      {/* 1. Navbar (Compact) */}
      <nav className="container mx-auto px-6 mb-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <Rocket className="text-neon-cyan w-6 h-6 animate-float" />
          <span className="font-black text-lg tracking-tighter uppercase">Mind Over Money</span>
        </div>
        <button className="px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-black hover:bg-white/5 transition-all uppercase tracking-widest">
          App Download
        </button>
      </nav>

      <main className="flex-1 container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">

        {/* Left Section: Hero & Value Prop (5/12) */}
        <div className="md:col-span-5 flex flex-col justify-center h-full space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6 backdrop-blur-md">
              <Sparkles size={12} className="text-neon-cyan" />
              <span className="text-[10px] font-black tracking-widest uppercase text-neon-cyan">ADHD Anti-Gravity Solution</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.85] uppercase tracking-tighter">
              재정적 중력을 <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-magenta neon-text-cyan">거스르다.</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed font-medium mb-8">
              ADHD 뇌를 무겁게 짓누르는 충동구매와 연체료.<br />
              이제 당신의 자산을 무중력 궤도에 올리세요.
            </p>

            <div className="flex items-center gap-4">
              <ShieldCheck className="text-neon-cyan w-10 h-10" />
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Defense Efficiency</p>
                <p className="text-2xl font-black text-white tracking-tighter">SUCCESS RATE 85%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Center/Right Section: Interactive Dashboard (7/12) */}
        <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 h-full py-4">

          {/* Top Left: Neuro-Switch Demo */}
          <div className="md:col-span-1 h-full">
            <NeuroSwitchMiniGame onComplete={() => setShowSuccess(true)} />
          </div>

          {/* Top Right: Stats & Mini Meta */}
          <div className="md:col-span-1 space-y-4 flex flex-col">
            <div className="flex-1 glass rounded-3xl p-6 border border-white/10 flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest tracking-tighter">Orbit Alert</p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-white">도시가스 납부</h4>
                  <p className="text-xs text-neon-magenta font-bold">기한 2일 남음 (D-2)</p>
                </div>
                <Satellite className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 glass rounded-3xl p-6 border border-white/10 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 flex items-center justify-center">
                <Zap className="text-neon-cyan" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Streak</p>
                <p className="text-xl font-black text-white tracking-tighter">연속 방어 12일차</p>
              </div>
            </div>
          </div>

          {/* Bottom: Liquid Pot Capsules (Full Width) */}
          <div className="md:col-span-2 glass rounded-[2.5rem] p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/70">Zero-G Capsules</h3>
              <Wallet size={16} className="text-neon-cyan" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              <FeaturePot icon={Wallet} title="생활비" color="#06B6D4" percent={70} spent={180000} />
              <FeaturePot icon={Shield} title="비상금" color="#D946EF" percent={45} spent={350000} />
              <FeaturePot icon={Satellite} title="적금" color="#FACC15" percent={95} spent={45000} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Social Proof (Ultra Compact) */}
      <footer className="container mx-auto px-6 h-12 flex justify-between items-center border-t border-white/5 relative z-20">
        <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 tracking-widest">
          <span className="flex items-center gap-1.5"><Star className="fill-neon-cyan text-neon-cyan w-3 h-3" /> 4.9 RATING</span>
          <span className="hidden md:block">|</span>
          <span className="hidden md:block">이미 1만 명의 파일럿이 궤도에 합류했습니다.</span>
        </div>
        <div className="flex gap-4 opacity-50">
          <Github size={14} className="hover:text-white cursor-pointer" />
          <Activity size={14} className="hover:text-white cursor-pointer" />
        </div>
      </footer>

      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-magenta/5 blur-[150px] -z-10 rounded-full" />

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-space-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-neon-cyan rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-neon-cyan/50">
                <CheckCircle className="text-space-dark w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-4">탈출 성공!</h2>
              <p className="text-gray-400 mb-10 text-sm leading-relaxed">뇌의 충동 중력을 이겨냈습니다. <br />이제 이성적인 자산 관리가 가능합니다.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-white text-space-dark rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                대시보드로 돌아가기 ↩
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

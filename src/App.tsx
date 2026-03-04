/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Sparkles, Wand2, Plus, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Character {
  id: string | number;
  name: string;
  color: string;
  bgText: string;
  image: string;
  description: string;
  accent: string;
  personality: string;
}

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Pinky",
    color: "#DB2777",
    bgText: "VIBRANT",
    image: "https://api.dicebear.com/7.x/big-smile/svg?seed=Pinky&backgroundColor=db2777&mood=happy",
    description: "A trendsetter with her loyal companion. Pinky brings style and energy to every corner of the digital world.",
    accent: "bg-pink-500",
    personality: "Stylish & Loyal"
  },
  {
    id: 2,
    name: "Sunny",
    color: "#EAB308",
    bgText: "BRIGHT",
    image: "https://api.dicebear.com/7.x/big-smile/svg?seed=Sunny&backgroundColor=eab308&mood=happy",
    description: "Radiating positivity in his signature yellow jacket, Sunny is always ready to lend a helping hand.",
    accent: "bg-yellow-500",
    personality: "Cheerful & Brave"
  },
  {
    id: 3,
    name: "Aqua",
    color: "#06B6D4",
    bgText: "FLUID",
    image: "https://api.dicebear.com/7.x/big-smile/svg?seed=Aqua&backgroundColor=06b6d4&mood=happy",
    description: "Cool, calm, and collected. Aqua flows through challenges with grace and a splash of creativity.",
    accent: "bg-cyan-500",
    personality: "Creative & Calm"
  },
  {
    id: 4,
    name: "Violet",
    color: "#8B5CF6",
    bgText: "MYSTIC",
    image: "https://api.dicebear.com/7.x/big-smile/svg?seed=Violet&backgroundColor=8b5cf6&mood=happy",
    description: "A dreamer with a touch of magic. Violet sees the world through a lens of wonder and mystery.",
    accent: "bg-purple-500",
    personality: "Dreamy & Kind"
  }
];

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % characters.length);
  }, [characters.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  }, [characters.length]);

  const generateCharacter = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const systemInstruction = `You are a creative character designer. Based on the user's prompt, generate a unique character profile in JSON format.
      The JSON should have:
      - name: A cool character name
      - color: A hex color code that matches their vibe
      - bgText: A single powerful word (uppercase) that represents their essence
      - description: A 2-sentence captivating backstory
      - personality: 2-3 words describing their personality
      - accent: A tailwind background color class (e.g., 'bg-purple-500') that matches the hex color.`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { 
          systemInstruction,
          responseMimeType: "application/json" 
        }
      });

      const data = JSON.parse(result.text || "{}");
      
      const newChar: Character = {
        id: Date.now(),
        name: data.name || "Unknown Hero",
        color: data.color || "#ffffff",
        bgText: data.bgText || "POWER",
        image: `https://api.dicebear.com/7.x/big-smile/svg?seed=${data.name}&backgroundColor=${(data.color || "#ffffff").replace('#', '')}&mood=happy`,
        description: data.description || "A newly discovered legend in the making.",
        accent: data.accent || "bg-white",
        personality: data.personality || "Unique & New"
      };

      setCharacters(prev => [newChar, ...prev]);
      setIndex(0);
      setPrompt("");
      setShowGenerator(false);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setShowGenerator(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const current = characters[index];

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-neutral-950 font-sans text-white">
      
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ 
            background: `radial-gradient(circle at 50% 50%, ${current.color}44 0%, transparent 70%)` 
          }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      </div>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-bold tracking-tighter">CHARACTER.AI</span>
        </motion.div>

        <div className="hidden items-center gap-8 md:flex">
          {['Models', 'Community', 'Pricing'].map((item) => (
            <a key={item} href="#" className="text-sm font-medium uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
          >
            <Plus size={14} />
            Create
          </button>
          <button className="rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:scale-105 transition-transform">
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative flex h-full items-center justify-center">
        
        {/* Dynamic Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.2, filter: 'blur(20px)', y: 50 }}
              animate={{ 
                opacity: 0.08, 
                scale: 1, 
                filter: 'blur(0px)', 
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)', y: -50 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <motion.h1 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="font-display text-[30vw] leading-none tracking-tighter text-white"
              >
                {current.bgText}
              </motion.h1>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="mt-[-2vw] flex gap-8"
              >
                <span className="text-2xl font-light tracking-[1em] opacity-50 uppercase">{current.personality}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Character Showcase */}
        <div className="relative z-10 flex h-full w-full max-w-7xl items-center justify-between px-12">
          
          {/* Left Side: Stats/Meta */}
          <div className="hidden lg:block w-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Origin</label>
                  <p className="text-sm font-medium mt-1">Sector 7-G / Unknown</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Power Level</label>
                  <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      className={`h-full ${current.accent}`}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">1.2k</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Chats</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">98%</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Rating</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center: 3D Character Image */}
          <div className="relative flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ 
                  scale: 0.5, 
                  opacity: 0, 
                  rotateY: direction > 0 ? 45 : -45,
                  z: -500 
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  rotateY: 0,
                  z: 0 
                }}
                exit={{ 
                  scale: 0.5, 
                  opacity: 0, 
                  rotateY: direction > 0 ? -45 : 45,
                  z: -500 
                }}
                transition={{ 
                  duration: 0.8, 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 20 
                }}
                className="relative aspect-square w-full max-w-[600px] perspective-1000"
              >
                {/* Glow Effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`absolute inset-0 rounded-full blur-[120px] ${current.accent}`}
                />
                
                <motion.img
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  src={current.image}
                  alt={current.name}
                  className="relative h-full w-full object-cover rounded-3xl shadow-2xl border border-white/10 cursor-pointer"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 h-24 w-24 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center"
                >
                  <Wand2 className="text-white/40" size={32} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Info Card */}
          <div className="w-full max-w-sm ml-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    className={`h-1 ${current.accent}`}
                  />
                  <h2 className="text-6xl font-bold tracking-tighter">{current.name}</h2>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">{current.personality}</p>
                </div>

                <p className="text-lg text-white/70 leading-relaxed font-light italic">
                  "{current.description}"
                </p>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-bold text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                    <Play size={18} fill="currentColor" />
                    Initialize AI
                  </button>
                  <button className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-12 z-30 flex items-center gap-12">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-widest opacity-30">0{index + 1}</span>
          <div className="flex gap-2">
            {characters.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  i === index ? 'w-12 bg-white' : 'w-3 bg-white/10 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold tracking-widest opacity-30">0{characters.length}</span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={prevSlide}
            className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all"
          >
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* AI Character Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-neutral-900 p-12 border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setShowGenerator(false)}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-4xl font-bold tracking-tight">Generate Legend</h3>
                  <p className="text-white/40">Describe the character you want to bring to life. Our AI will handle the rest.</p>
                </div>

                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A cybernetic samurai from a neon-drenched future who fights with a blade of pure energy..."
                    className="w-full h-40 rounded-2xl bg-white/5 p-6 text-lg border border-white/10 focus:border-white/30 outline-none transition-all resize-none"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-white/20">
                    Powered by Gemini AI
                  </div>
                </div>

                <button
                  onClick={generateCharacter}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white py-5 text-lg font-bold text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Forging Character...
                    </>
                  ) : (
                    <>
                      <Wand2 size={24} />
                      Generate Character
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambient Text */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 z-30 hidden xl:block">
        <div className="flex flex-col gap-24 opacity-10">
          <span className="writing-vertical-rl text-[10px] uppercase tracking-[1em]">Evolution</span>
          <span className="writing-vertical-rl text-[10px] uppercase tracking-[1em]">Intelligence</span>
          <span className="writing-vertical-rl text-[10px] uppercase tracking-[1em]">Creation</span>
        </div>
      </div>
    </div>
  );
}

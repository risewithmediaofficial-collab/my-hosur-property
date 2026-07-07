import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "../../lib/utils";

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "#111827", forceLookX, forceLookY }) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const pupilPosition = useMemo(() => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const centerX = pupil.left + pupil.width / 2;
    const centerY = pupil.top + pupil.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }, [forceLookX, forceLookY, maxDistance, mouseX, mouseY]);

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: "transform 0.12s ease-out",
      }}
    />
  );
};

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "#ffffff", pupilColor = "#111827", isBlinking = false, forceLookX, forceLookY }) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const pupilPosition = useMemo(() => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const centerX = eye.left + eye.width / 2;
    const centerY = eye.top + eye.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }, [forceLookX, forceLookY, maxDistance, mouseX, mouseY]);

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center overflow-hidden rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: "transform 0.12s ease-out",
          }}
        />
      )}
    </div>
  );
};

export function AnimatedCharactersLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);

  useEffect(() => {
    const blinkLoop = (setBlinking) => {
      const timeout = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          blinkLoop(setBlinking);
        }, 140);
      }, Math.random() * 4000 + 2800);
      return timeout;
    };

    const purpleTimeout = blinkLoop(setIsPurpleBlinking);
    const blackTimeout = blinkLoop(setIsBlackBlinking);
    return () => {
      clearTimeout(purpleTimeout);
      clearTimeout(blackTimeout);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_45%)]" />
      <div className="absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4 text-orange-300" />
            Secure access
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
            Live preview
          </div>
        </div>

        <div className="mt-6 flex items-end justify-center gap-3">
          <div className="relative h-48 w-44 rounded-[2rem] bg-gradient-to-b from-violet-500 to-violet-700 p-3 shadow-2xl">
            <div className="absolute left-5 top-7 flex gap-4">
              <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#111827" isBlinking={isPurpleBlinking} forceLookX={isTyping ? 3 : undefined} forceLookY={isTyping ? 4 : undefined} />
              <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#111827" isBlinking={isPurpleBlinking} forceLookX={isTyping ? 3 : undefined} forceLookY={isTyping ? 4 : undefined} />
            </div>
          </div>

          <div className="relative h-36 w-28 rounded-[1.5rem] bg-gradient-to-b from-slate-900 to-slate-700 p-3 shadow-2xl">
            <div className="absolute left-4 top-5 flex gap-3">
              <EyeBall size={13} pupilSize={5} maxDistance={3} eyeColor="white" pupilColor="#111827" isBlinking={isBlackBlinking} forceLookX={isTyping ? 0 : undefined} forceLookY={isTyping ? -3 : undefined} />
              <EyeBall size={13} pupilSize={5} maxDistance={3} eyeColor="white" pupilColor="#111827" isBlinking={isBlackBlinking} forceLookX={isTyping ? 0 : undefined} forceLookY={isTyping ? -3 : undefined} />
            </div>
          </div>

          <div className="relative h-32 w-20 rounded-[1.25rem] bg-gradient-to-b from-amber-300 to-orange-400 p-3 shadow-2xl">
            <div className="absolute left-2 top-4 flex gap-3">
              <Pupil size={9} maxDistance={5} pupilColor="#111827" forceLookX={isTyping ? -4 : undefined} forceLookY={isTyping ? -2 : undefined} />
              <Pupil size={9} maxDistance={5} pupilColor="#111827" forceLookX={isTyping ? -4 : undefined} forceLookY={isTyping ? -2 : undefined} />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Smart sign-in experience
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            A polished, animated entry point for buyers and sellers to access verified listings and account updates.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="preview-email" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">Email</Label>
              <Input
                id="preview-email"
                placeholder="hello@myhosurproperty.com"
                className="h-10 border-white/10 bg-slate-900/80 text-slate-100 placeholder:text-slate-500"
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preview-password" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">Password</Label>
              <div className="relative">
                <Input
                  id="preview-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 border-white/10 bg-slate-900/80 pr-10 text-slate-100 placeholder:text-slate-500"
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="preview-remember" />
                <Label htmlFor="preview-remember" className="text-sm text-slate-300">Remember me</Label>
              </div>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-300 hover:bg-white/10 hover:text-white">
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = AnimatedCharactersLoginPage;
export default AnimatedCharactersLoginPage;

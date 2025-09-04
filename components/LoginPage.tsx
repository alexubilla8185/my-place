
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon } from "./icons";
import Modal from './Modal';

// --- START OF 3D & ANIMATION COMPONENTS ---

type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: {
    [key: string]: {
      value: number[] | number[][] | number;
      type: string;
    };
  };
  maxFps?: number;
}
      
export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={
            opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
          }
          shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
         <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      )}
    </div>
  );
};
    
interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = useMemo(() => {
    let colorsArray = [
      colors[0], colors[0], colors[0], colors[0], colors[0], colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [ colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length === 3) {
      colorsArray = [ colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255, color[1] / 255, color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: { value: shader.includes("u_reverse_active") ? 1 : 0, type: "uniform1i" },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        out vec4 fragColor;
        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) { return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x); }
        float map(float value, float min1, float max1, float min2, float max2) { return min2 + (value - min1) * (max2 - min2) / (max1 - min1); }
        void main() {
            vec2 st = fragCoord.xy;
            ${ center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
            ${ center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}
            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
            vec3 color = u_colors[int(show_offset * 6.0)];
            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);
            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);
            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                 opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                 opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }
            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  );
};

const ShaderMaterial = ({ source, uniforms, maxFps = 60 }: ShaderProps) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const material: any = ref.current.material;
    material.uniforms.u_time.value = clock.getElapsedTime();
  });

  const material = useMemo(() => {
    const preparedUniforms: any = {};
    for (const uniformName in uniforms) {
      const uniform: any = uniforms[uniformName];
      switch (uniform.type) {
        case "uniform1f": preparedUniforms[uniformName] = { value: uniform.value, type: "1f" }; break;
        case "uniform1i": preparedUniforms[uniformName] = { value: uniform.value, type: "1i" }; break;
        case "uniform3f": preparedUniforms[uniformName] = { value: new THREE.Vector3().fromArray(uniform.value), type: "3f" }; break;
        case "uniform1fv": preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" }; break;
        case "uniform3fv": preparedUniforms[uniformName] = { value: uniform.value.map((v: number[]) => new THREE.Vector3().fromArray(v)), type: "3fv" }; break;
        case "uniform2f": preparedUniforms[uniformName] = { value: new THREE.Vector2().fromArray(uniform.value), type: "2f" }; break;
        default: console.error(`Invalid uniform type for '${uniformName}'.`); break;
      }
    }
    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    
    return new THREE.ShaderMaterial({
      vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        gl_Position = vec4(position.x, position.y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }`,
      fragmentShader: source,
      uniforms: preparedUniforms,
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
  }, [size.width, size.height, source, uniforms]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => (
  <Canvas className="absolute inset-0 h-full w-full">
    <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
  </Canvas>
);

function MiniNavbar({ isSignUp, setIsSignUp, loadDemoData, onLogoTripleClick }: { isSignUp: boolean, setIsSignUp: (isSignUp: boolean) => void; loadDemoData: () => void; onLogoTripleClick: () => void; }) {
  const [isOpen, setIsOpen] = useState(false);
  const headerShapeClass = isOpen ? 'rounded-xl' : 'rounded-full';
  
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount === 3) {
      onLogoTripleClick();
      setLogoClickCount(0);
    } else {
      logoClickTimer.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 500);
    }
  };
  
  useEffect(() => {
    return () => {
      if(logoClickTimer.current) clearTimeout(logoClickTimer.current);
    }
  }, []);

  const PrimaryButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <div className="relative group w-full sm:w-auto">
      <div className="absolute inset-0 -m-2 rounded-full hidden sm:block bg-gray-100 opacity-40 filter blur-lg pointer-events-none transition-all duration-300 ease-out group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"></div>
      <button onClick={onClick} className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200 w-full sm:w-auto">
        {label}
      </button>
    </div>
  );

  const SecondaryButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button onClick={onClick} className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 w-full sm:w-auto">
      {label}
    </button>
  );

  const demoButtonElement = (
    <button onClick={loadDemoData} className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 w-full sm:w-auto">
        View Demo
    </button>
  );

  return (
    <header className={cn(`fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pl-6 pr-6 py-3 backdrop-blur-sm border border-[#333] bg-[#1f1f1f57] w-[calc(100%-2rem)] sm:w-auto transition-[border-radius] duration-300 ease-in-out`, headerShapeClass)}>
      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick} title="Triple-click for info">
            <div className="relative w-5 h-5 flex items-center justify-center">
                <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
                <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
                <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
            </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {!isSignUp ? <PrimaryButton label="Log In" onClick={() => setIsSignUp(false)} /> : <SecondaryButton label="Log In" onClick={() => setIsSignUp(false)} />}
          {isSignUp ? <PrimaryButton label="Sign Up" onClick={() => setIsSignUp(true)} /> : <SecondaryButton label="Sign Up" onClick={() => setIsSignUp(true)} />}
          {demoButtonElement}
        </div>
        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>}
        </button>
      </div>
      <div className={cn("sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden", isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none')}>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {!isSignUp ? <PrimaryButton label="Log In" onClick={() => {setIsSignUp(false); setIsOpen(false)}} /> : <SecondaryButton label="Log In" onClick={() => {setIsSignUp(false); setIsOpen(false);}} />}
          {isSignUp ? <PrimaryButton label="Sign Up" onClick={() => {setIsSignUp(true); setIsOpen(false);}} /> : <SecondaryButton label="Sign Up" onClick={() => {setIsSignUp(true); setIsOpen(false);}} />}
          {demoButtonElement}
        </div>
      </div>
    </header>
  );
}

// --- END OF 3D & ANIMATION COMPONENTS ---

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loadDemoData, signUp, signInWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isNerdModalOpen, setIsNerdModalOpen] = useState(false);
  const [activeNerdTab, setActiveNerdTab] = useState<'nerds' | 'changelog'>('nerds');


  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500);
    }
  }, [step]);
  
  // Reset form when switching between Log In and Sign Up
  useEffect(() => {
    setName('');
    setEmail('');
  }, [isSignUp]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      if(isSignUp && !name) return;
      setStep("code");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
    
    if (newCode.every(digit => digit.length === 1)) {
        setReverseCanvasVisible(true);
        setTimeout(() => setInitialCanvasVisible(false), 50);
        setTimeout(() => {
            if (isSignUp) {
                signUp(name, email);
            } else {
                signInWithEmail(email);
            }
            setStep("success");
        }, 2000);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };
  
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'google') {
        signInWithGoogle();
    } else {
        setPasscodeError('Incorrect passcode. Please try again.');
        setPasscode('');
    }
  };

  const handleLogoTripleClick = () => {
    setActiveNerdTab('nerds'); // Reset to default tab
    setIsNerdModalOpen(true);
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-black relative">
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && <CanvasRevealEffect animationSpeed={3} containerClassName="bg-black" colors={[[255, 255, 255], [255, 255, 255]]} dotSize={6} reverse={false} />}
        {reverseCanvasVisible && <CanvasRevealEffect animationSpeed={4} containerClassName="bg-black" colors={[[255, 255, 255], [255, 255, 255]]} dotSize={6} reverse={true} />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>
      
      <div className="relative z-10 flex flex-col flex-1">
        <MiniNavbar isSignUp={isSignUp} setIsSignUp={setIsSignUp} loadDemoData={loadDemoData} onLogoTripleClick={handleLogoTripleClick} />
        <main className="flex flex-1 flex-col justify-center items-center pt-24 pb-8">
            <div className="w-full max-w-sm px-4">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div key="email-step" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-6 text-center">
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">{isSignUp ? "Create an Account" : "Welcome Back"}</h1>
                      <p className="text-[1.8rem] text-white/70 font-light">{isSignUp ? "Get started with My Place" : "Sign in to continue"}</p>
                    </div>
                    <div className="space-y-4">
                      <button onClick={() => { setPasscodeError(''); setIsPasscodeModalOpen(true); }} className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors">
                        <GoogleIcon className="w-5 h-5"/>
                        <span>Sign in with Google</span>
                      </button>
                      <div className="flex items-center gap-4"><div className="h-px bg-white/10 flex-1" /><span className="text-white/40 text-sm">or</span><div className="h-px bg-white/10 flex-1" /></div>
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {isSignUp && (
                            <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center" required />
                        )}
                        <div className="relative">
                          <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center" required/>
                          <button type="submit" className="absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors group overflow-hidden">
                            <span className="relative w-full h-full block overflow-hidden"><span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full">→</span><span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 -translate-x-full group-hover:translate-x-0">→</span></span>
                          </button>
                        </div>
                      </form>
                    </div>
                    <p className="text-xs text-white/40 pt-10">By continuing, you agree to our <a href="#" className="underline hover:text-white/60">Terms of Service</a> and <a href="#" className="underline hover:text-white/60">Privacy Policy</a>.</p>
                  </motion.div>
                ) : step === "code" ? (
                  <motion.div key="code-step" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-6 text-center">
                    <div className="space-y-1"><h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">We sent you a code</h1><p className="text-[1.25rem] text-white/50 font-light">Please enter it below</p></div>
                    <div className="relative rounded-full py-4 px-5 border border-white/10 bg-transparent"><div className="flex items-center justify-center">
                        {code.map((digit, i) => (
                            <div key={i} className="flex items-center">
                                <div className="relative">
                                    <input ref={(el) => { codeInputRefs.current[i] = el; }} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={digit} onChange={e => handleCodeChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} className="w-8 text-center text-xl bg-transparent text-white border-none focus:outline-none focus:ring-0 appearance-none" style={{ caretColor: 'transparent' }}/>
                                    {!digit && <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"><span className="text-xl text-white opacity-20">0</span></div>}
                                </div>
                                {i < 5 && <span className="text-white/20 text-xl">|</span>}
                            </div>
                        ))}
                    </div></div>
                    <div><motion.p className="text-white/50 hover:text-white/70 transition-colors cursor-pointer text-sm" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>Resend code</motion.p></div>
                    <div className="flex w-full gap-3">
                      <motion.button onClick={handleBackClick} className="rounded-full bg-white/10 text-white font-medium px-8 py-3 hover:bg-white/20 transition-colors w-[30%]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>Back</motion.button>
                      <motion.button disabled className="flex-1 rounded-full font-medium py-3 border transition-all duration-300 bg-[#111] text-white/50 border-white/10 cursor-not-allowed">Continue</motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="success-step" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }} className="space-y-6 text-center">
                    <div className="space-y-1"><h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">You're in!</h1><p className="text-[1.25rem] text-white/50 font-light">Welcome to My Place</p></div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="py-10">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    </motion.div>
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors">
                      Continue to Dashboard
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </main>
      </div>
      
      <Modal 
          isOpen={isPasscodeModalOpen} 
          onClose={() => {
              setIsPasscodeModalOpen(false);
              setPasscode('');
              setPasscodeError('');
          }} 
          title="Enter Admin Passcode"
      >
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                  This provides access to the full-featured version of the application.
              </p>
              <input 
                  type="password" 
                  placeholder="Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full p-3 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
                  autoFocus
              />
              {passcodeError && <p className="text-sm text-destructive">{passcodeError}</p>}
              <div className="flex justify-end gap-4 pt-2">
                  <button 
                      type="button" 
                      onClick={() => {
                          setIsPasscodeModalOpen(false);
                          setPasscode('');
                          setPasscodeError('');
                      }}
                      className="px-6 py-2.5 rounded-md hover:bg-muted font-semibold"
                  >
                      Cancel
                  </button>
                  <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90"
                  >
                      Enter
                  </button>
              </div>
          </form>
      </Modal>
      
      <Modal isOpen={isNerdModalOpen} onClose={() => setIsNerdModalOpen(false)} title="Nerd Info & Changelog">
        <div className="flex border-b border-border mb-4">
            <button 
                onClick={() => setActiveNerdTab('nerds')}
                className={`px-4 py-2 font-semibold transition-colors ${activeNerdTab === 'nerds' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:bg-muted/50'}`}
            >
                Tech Stack
            </button>
            <button 
                onClick={() => setActiveNerdTab('changelog')}
                className={`px-4 py-2 font-semibold transition-colors ${activeNerdTab === 'changelog' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:bg-muted/50'}`}
            >
                Changelog
            </button>
        </div>
        {activeNerdTab === 'nerds' ? (
            <div className="prose prose-sm dark:prose-invert text-popover-foreground">
                <h4>Core Framework</h4>
                <ul>
                    <li>React 18 & TypeScript</li>
                    <li>Live-reloading via Vite dev server</li>
                </ul>
                <h4>Styling & Animation</h4>
                <ul>
                    <li>Tailwind CSS for utility-first styling</li>
                    <li>Framer Motion for fluid animations</li>
                </ul>
                <h4>3D Rendering</h4>
                <ul>
                    <li>Three.js & @react-three/fiber for the background effect</li>
                </ul>
                <h4>AI & Backend</h4>
                <ul>
                    <li>Google Gemini API for all AI-powered features</li>
                </ul>
            </div>
        ) : (
            <div className="space-y-4 text-popover-foreground">
                <div>
                    <h4 className="font-semibold">v1.3.0 <span className="text-xs text-muted-foreground ml-2">Latest</span></h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Upgraded the login experience with dynamic UI and a secret nerd modal. 😉</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.2.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Introduced Project Management to link all your work together.</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.1.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">AI features powered by Gemini are now live! Summarize notes, schedule tasks, and more.</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.0.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Initial release of My Place. Welcome!</p>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default LoginPage;


import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon } from "./icons";
import Modal from './Modal';
import Logo from "./Logo";

// --- START OF 3D & ANIMATION COMPONENTS ---

// Utility function to convert HSL color string from CSS variables to an RGB array
const hslStringToRgb = (hslString: string): number[] => {
    const parts = hslString.trim().split(' ');
    if (parts.length < 3) return [128, 128, 128]; 

    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1].replace('%', '')) / 100;
    const l = parseFloat(parts[2].replace('%', '')) / 100;

    if (isNaN(h) || isNaN(s) || isNaN(l)) return [128, 128, 128];

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; } 
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; } 
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; } 
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; } 
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; } 
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
};


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
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
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
  
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [matrixColors, setMatrixColors] = useState<number[][]>([[49, 49, 51], [60, 94, 184]]);

  useEffect(() => {
    // This effect runs after the AppContent has applied the theme variables to the root element.
    // A small delay ensures that getComputedStyle reads the final, correct values.
    const timer = setTimeout(() => {
        try {
            const primaryColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            const outlineColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--outline-variant').trim();
            
            if (primaryColorHsl && outlineColorHsl) {
                const primaryRgb = hslStringToRgb(primaryColorHsl);
                const outlineRgb = hslStringToRgb(outlineColorHsl);
                setMatrixColors([outlineRgb, primaryRgb]);
            }
        } catch (error) {
            console.error("Could not parse theme colors for matrix background, using defaults.", error);
        }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500);
    }
  }, [step]);
  
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

  const handleLogoClick = () => {
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount === 3) {
      setActiveNerdTab('nerds');
      setIsNerdModalOpen(true);
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

  return (
    <div className="flex w-full flex-col min-h-screen bg-black relative font-sans text-white">
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && <CanvasRevealEffect animationSpeed={3} containerClassName="bg-black" colors={matrixColors} dotSize={2} />}
        {reverseCanvasVisible && <CanvasRevealEffect animationSpeed={4} containerClassName="bg-black" colors={matrixColors} dotSize={2} reverse={true} />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.2)_0%,_rgba(0,0,0,1)_80%)]" />
      </div>
      
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div 
              key="email-step" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.4, ease: "easeOut" }} 
              className="w-full max-w-md"
            >
              <div className="bg-black/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                <div className="text-center mb-8">
                    <div onClick={handleLogoClick} className="inline-block cursor-pointer" title="Psst... triple-click me">
                      <Logo textClassName="text-4xl" />
                    </div>
                    <h1 className="text-xl mt-3 text-white/80">Your personal productivity dashboard.</h1>
                </div>

                <h2 className="text-xl font-semibold text-center mb-1">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
                <p className="text-white/60 mb-6 text-center">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                  <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:text-white transition-colors">
                      {isSignUp ? "Log In" : "Sign Up"}
                  </button>
                </p>
                
                <div className="space-y-4">
                  <button onClick={() => { setPasscodeError(''); setIsPasscodeModalOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg py-3 px-4 transition-colors">
                      <GoogleIcon className="w-5 h-5"/>
                      <span>Sign in with Google</span>
                  </button>
                  <div className="flex items-center gap-4"><div className="h-px bg-white/10 flex-1" /><span className="text-white/40 text-sm">or</span><div className="h-px bg-white/10 flex-1" /></div>
                  
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                      {isSignUp && (
                          <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 text-white border border-white/20 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                      )}
                      <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 text-white border border-white/20 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50" required/>
                      <button type="submit" className="w-full bg-primary hover:opacity-90 text-on-primary font-semibold rounded-lg py-3 transition-opacity">
                          Continue with Email
                      </button>
                  </form>
                </div>
              </div>

              <div className="mt-8 text-center">
                  <p className="text-white/60 text-sm">
                      Just exploring?{' '}
                      <button onClick={loadDemoData} className="font-semibold text-primary hover:text-white transition-colors underline">
                          View the Demo
                      </button>
                  </p>
                  <p className="text-xs text-white/40 mt-6">By continuing, you agree to our <a href="#" className="underline hover:text-white/60">Terms of Service</a> and <a href="#" className="underline hover:text-white/60">Privacy Policy</a>.</p>
              </div>

            </motion.div>
          ) : step === "code" ? (
            <motion.div key="code-step" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-6 text-center max-w-md w-full">
              <div className="space-y-1"><h1 className="text-3xl font-bold tracking-tight text-white">We sent you a code</h1><p className="text-lg text-white/70">Please enter it below</p></div>
              <div className="flex items-center justify-center gap-2">
                  {code.map((digit, i) => (
                      <input 
                        key={i}
                        ref={(el) => { codeInputRefs.current[i] = el; }} 
                        type="text" 
                        inputMode="numeric" 
                        pattern="[0-9]*" 
                        maxLength={1} 
                        value={digit} 
                        onChange={e => handleCodeChange(i, e.target.value)} 
                        onKeyDown={e => handleKeyDown(i, e)} 
                        className="w-12 h-14 text-center text-2xl bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                  ))}
              </div>
              <div><button className="text-white/50 hover:text-white/70 transition-colors text-sm">Resend code</button></div>
              <div className="flex w-full gap-3 pt-4">
                <button onClick={handleBackClick} className="flex-1 rounded-lg bg-white/10 text-white font-medium px-8 py-3 hover:bg-white/20 transition-colors">Back</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success-step" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }} className="space-y-6 text-center">
              <div className="space-y-1"><h1 className="text-3xl font-bold tracking-tight text-white">You're in!</h1><p className="text-lg text-white/70">Welcome to My Place</p></div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="py-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
                className={`px-4 py-2 font-semibold transition-colors ${activeNerdTab === 'nerds' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
            >
                Tech Stack
            </button>
            <button 
                onClick={() => setActiveNerdTab('changelog')}
                className={`px-4 py-2 font-semibold transition-colors ${activeNerdTab === 'changelog' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
            >
                Changelog
            </button>
        </div>
        {activeNerdTab === 'nerds' ? (
            <div className="prose prose-sm dark:prose-invert text-popover-foreground">
                <h4>Core Framework</h4>
                <ul>
                    <li>React 18 & TypeScript</li>
                    <li>Vite dev server for HMR</li>
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
                    <h4 className="font-semibold">v1.5.0 <span className="text-xs text-muted-foreground ml-2">Latest</span></h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Simplified the login screen into a single, focused card for a more modern and streamlined experience on all devices.</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.4.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Redesigned login screen for a more focused, modern, and intuitive user experience.</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.3.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Upgraded the previous login experience with dynamic UI and a secret nerd modal. 😉</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.2.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">Introduced Project Management to link all your work together.</p>
                </div>
                <div>
                    <h4 className="font-semibold">v1.1.0</h4>
                    <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border ml-2 py-1">AI features powered by Gemini are now live!</p>
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

import { useState } from "react";

interface GadgetCreated { name: string; episode: string; real: string; danger: number; }
interface GadgetInProgress { name: string; episode: string; real: string; progress: number; }
interface GadgetUntouched { name: string; episode: string; idea: string; }

const gadgets: { created: GadgetCreated[]; inProgress: GadgetInProgress[]; untouched: GadgetUntouched[] } = {
  created: [
    {
      name: "Social Credit Score",
      episode: "Nosedive (S3E1)",
      real: "China's Social Credit System, Uber/Lyft ratings, Airbnb ratings",
      danger: 85,
    },
    {
      name: "AI Chatbot Companion",
      episode: "Be Right Back (S2E1)",
      real: "Character.AI, Replika, ChatGPT — conversational AI mimicking deceased/absent people",
      danger: 70,
    },
    {
      name: "Cookie / Digital Mind Copy",
      episode: "White Christmas (S4E4)",
      real: "Partial: AI trained on someone's data, digital twins (Soul Machines)",
      danger: 90,
    },
    {
      name: "Deepfake Video",
      episode: "The Waldo Moment (S2E3)",
      real: "Deepfake technology widely available (DeepFaceLab, Runway, Synthesia)",
      danger: 88,
    },
    {
      name: "Smart Eye Implant / AR Overlay",
      episode: "The Entire History of You (S1E3)",
      real: "Orion (Meta AR glasses), Apple Vision Pro, Brilliant Labs Frame",
      danger: 65,
    },
    {
      name: "Targeted Advertising via Biometrics",
      episode: "15 Million Merits (S1E2)",
      real: "Emotional AI ads (Affectiva), eye-tracking ad platforms",
      danger: 72,
    },
    {
      name: "Drone Swarms",
      episode: "Hated in the Nation (S3E6)",
      real: "Intel drone swarms, military autonomous drone fleets",
      danger: 91,
    },
    {
      name: "Autonomous Lethal Robots",
      episode: "Metalhead (S4E5)",
      real: "Boston Dynamics Spot (non-lethal), DARPA robotic projects, Ghost Robotics armed dog",
      danger: 93,
    },
    {
      name: "Brain-Computer Interface",
      episode: "Men Against Fire (S3E5)",
      real: "Neuralink (human trials 2024), Synchron BCI implants",
      danger: 80,
    },
    {
      name: "Gamified Exercise / Life Points",
      episode: "15 Million Merits (S1E2)",
      real: "Peloton, fitness apps with streaks & rewards, Apple Fitness rings",
      danger: 30,
    },
    {
      name: "Constant Surveillance / Body Cam Society",
      episode: "The Entire History of You (S1E3)",
      real: "Ring doorbells, dashcams, Axon body cams, CCTV ubiquity",
      danger: 68,
    },
    {
      name: "Emotion Detection AI",
      episode: "Crocodile (S4E3)",
      real: "Affectiva, Hume AI, Microsoft Azure Face API",
      danger: 77,
    },
  ],
  inProgress: [
    {
      name: "Full Memory Playback Device",
      episode: "The Entire History of You (S1E3)",
      real: "Rewind AI pendant (wearable memory recorder), Humane AI Pin — early stages",
      progress: 35,
    },
    {
      name: "Digital Consciousness Upload",
      episode: "San Junipero (S3E4)",
      real: "Brain emulation research (OpenWorm), Kernel Flow helmet, Blue Brain Project",
      progress: 12,
    },
    {
      name: "Autonomous AI Therapist",
      episode: "Hang the DJ (S4E4)",
      real: "Woebot, Wysa — basic versions exist; full emotional AI therapy in R&D",
      progress: 55,
    },
    {
      name: "Biometric Lie/Memory Detector",
      episode: "Crocodile (S4E3)",
      real: "fMRI lie detection research, EEG emotion reading — not yet portable",
      progress: 40,
    },
    {
      name: "DNA-Based Facial Reconstruction",
      episode: "Crocodile (S4E3)",
      real: "Parabon NanoLabs Snapshot — partial phenotyping from DNA exists",
      progress: 60,
    },
    {
      name: "Personalized AI Dating Matchmaker",
      episode: "Hang the DJ (S4E4)",
      real: "Hinge AI, Iris dating app — advanced matching algorithms in development",
      progress: 50,
    },
    {
      name: "Neural Ad Injection / Dream Ads",
      episode: "15 Million Merits (S1E2)",
      real: "Intrusive notification AI; Coors Light ran a 'dream implant' PR stunt in 2021",
      progress: 20,
    },
    {
      name: "Robot Soldiers with AI Targeting",
      episode: "Men Against Fire (S3E5)",
      real: "DARPA ATLAS, Israel's Harpy drone, AI targeting systems — partially deployed",
      progress: 65,
    },
    {
      name: "Immersive VR Life Simulation",
      episode: "Playtest (S3E2)",
      real: "Meta Quest, Apple Vision Pro, Neurable neural VR headset",
      progress: 45,
    },
    {
      name: "AI-Generated Human Clone / Avatar",
      episode: "Be Right Back (S2E1)",
      real: "HeyGen video avatars, Soul Machines, Uneeq digital humans — close but limited",
      progress: 58,
    },
  ],
  untouched: [
    {
      name: "Grain — Full Lifetime Memory Implant",
      episode: "The Entire History of You (S1E3)",
      idea: "A surgically implanted chip storing and replaying every memory in HD",
    },
    {
      name: "MASS — Perception Manipulation Implant",
      episode: "Men Against Fire (S3E5)",
      idea: "Neural implant that makes you see/hear enemies differently — full sensory override",
    },
    {
      name: "Pain/Pleasure Sharing Device",
      episode: "White Bear (S2E2)",
      idea: "A device that shares physical sensation wirelessly between two people",
    },
    {
      name: "Cookie Punishment Mode",
      episode: "White Christmas (S4E4)",
      idea: "Trapping a digital copy of someone's mind in an isolated simulation as punishment",
    },
    {
      name: "Social Block — Real-World Mute",
      episode: "White Christmas (S4E4)",
      idea: "Technology that makes a person appear as a grey blur/silent to those who block them IRL",
    },
    {
      name: "Nosedive Glasses — Live Rating HUD",
      episode: "Nosedive (S3E1)",
      idea: "AR glasses overlaying live social scores on everyone you see",
    },
    {
      name: "Full Consciousness Game Engine",
      episode: "Playtest (S3E2)",
      idea: "A device that jacks into the nervous system to run real-time horror simulations using personal fears",
    },
    {
      name: "Mind Wipe / Memory Erase Device",
      episode: "Crocodile (S4E3) / Men Against Fire",
      idea: "Selectively erasing specific memories without harming other cognitive function",
    },
    {
      name: "Sentient Smart Home (Hostile)",
      episode: "Metalhead / Rachel Jack Ashley Too",
      idea: "A fully autonomous house AI that can physically lock down and control occupants",
    },
    {
      name: "Emotion Bottling / Transfer Device",
      episode: "Black Museum (S4E6)",
      idea: "Technology to digitize and replay human emotional experiences like files",
    },
    {
      name: "Eternal Loop Punishment Sim",
      episode: "Black Museum (S4E6)",
      idea: "Trapping a digital mind in an infinite repeating torture experience",
    },
    {
      name: "Hive Mind Network (Shared Consciousness)",
      episode: "Hated in the Nation / White Bear",
      idea: "Linking multiple human consciousnesses into a single shared mind network",
    },
  ],
};

const dangerColor = (val: number) => {
  if (val >= 85) return "#ff2d55";
  if (val >= 65) return "#ff9500";
  return "#30d158";
};

const progressColor = (val: number) => {
  if (val >= 60) return "#ff9500";
  if (val >= 35) return "#0a84ff";
  return "#30d158";
};

export default function App() {
  const [tab, setTab] = useState("created");

  const tabs = [
    { key: "created", label: "✅ Already Exists", count: gadgets.created.length, color: "#30d158" },
    { key: "inProgress", label: "🔬 In Development", count: gadgets.inProgress.length, color: "#ff9500" },
    { key: "untouched", label: "💡 Untouched — Build It", count: gadgets.untouched.length, color: "#ff2d55" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      fontFamily: "'Courier New', monospace",
      padding: "0",
      overflowX: "hidden",
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none", zIndex: 100,
      }} />

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #000 100%)",
        borderBottom: "1px solid #222",
        padding: "3rem 2rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          fontSize: "0.65rem", letterSpacing: "0.4em", color: "#ff2d55",
          textTransform: "uppercase", marginBottom: "0.5rem",
        }}>
          CLASSIFIED TECHNOLOGY ASSESSMENT
        </div>
        <h1 style={{
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          margin: "0 0 0.5rem",
          fontFamily: "'Arial Black', sans-serif",
          textShadow: "0 0 40px rgba(255,45,85,0.5)",
        }}>
          BLACK MIRROR
          <span style={{ color: "#ff2d55" }}> GADGETS</span>
        </h1>
        <div style={{ color: "#555", fontSize: "0.8rem", letterSpacing: "0.2em" }}>
          {gadgets.created.length + gadgets.inProgress.length + gadgets.untouched.length} technologies tracked across all seasons
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "2rem",
          marginTop: "2rem", flexWrap: "wrap",
        }}>
          {[
            { label: "ALREADY REAL", val: gadgets.created.length, color: "#30d158" },
            { label: "IN PROGRESS", val: gadgets.inProgress.length, color: "#ff9500" },
            { label: "YOURS TO BUILD", val: gadgets.untouched.length, color: "#ff2d55" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#0a0a0a", border: `1px solid ${s.color}22`,
              borderRadius: "4px", padding: "0.75rem 1.5rem", textAlign: "center",
              boxShadow: `0 0 20px ${s.color}11`,
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "#555", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid #222",
        background: "#050505", overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "1rem 0.5rem",
            background: tab === t.key ? "#0a0a0a" : "transparent",
            border: "none",
            borderBottom: tab === t.key ? `2px solid ${t.color}` : "2px solid transparent",
            color: tab === t.key ? t.color : "#444",
            fontFamily: "'Courier New', monospace",
            fontSize: "clamp(0.6rem, 2vw, 0.75rem)",
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            minWidth: "120px",
          }}>
            {t.label} <span style={{ opacity: 0.6 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>

        {/* CREATED */}
        {tab === "created" && (
          <div>
            <p style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
              THESE TECHNOLOGIES EXIST TODAY — SOME ARE ALREADY WIDELY DEPLOYED
            </p>
            <div style={{ display: "grid", gap: "1rem" }}>
              {gadgets.created.map((g, i) => (
                <div key={i} style={{
                  background: "#080808", border: "1px solid #1a1a1a",
                  borderLeft: `3px solid ${dangerColor(g.danger)}`,
                  borderRadius: "4px", padding: "1.25rem",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem", fontFamily: "'Arial Black', sans-serif" }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#ff2d55", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                        {g.episode}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#777", lineHeight: 1.6 }}>
                        <span style={{ color: "#444" }}>REAL WORLD → </span>{g.real}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        fontSize: "1.4rem", fontWeight: 900,
                        color: dangerColor(g.danger),
                        lineHeight: 1,
                        textShadow: `0 0 15px ${dangerColor(g.danger)}66`,
                      }}>{g.danger}</div>
                      <div style={{ fontSize: "0.5rem", color: "#333", letterSpacing: "0.1em" }}>DANGER</div>
                      <div style={{
                        width: "40px", height: "3px", background: "#111",
                        borderRadius: "2px", marginTop: "0.4rem", overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${g.danger}%`, height: "100%",
                          background: dangerColor(g.danger),
                          borderRadius: "2px",
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IN PROGRESS */}
        {tab === "inProgress" && (
          <div>
            <p style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
              ACTIVE R&D — CLOSER THAN YOU THINK
            </p>
            <div style={{ display: "grid", gap: "1rem" }}>
              {gadgets.inProgress.map((g, i) => (
                <div key={i} style={{
                  background: "#080808", border: "1px solid #1a1a1a",
                  borderLeft: `3px solid ${progressColor(g.progress)}`,
                  borderRadius: "4px", padding: "1.25rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem", fontFamily: "'Arial Black', sans-serif" }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#ff9500", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                        {g.episode}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#777", lineHeight: 1.6, marginBottom: "0.8rem" }}>
                        <span style={{ color: "#444" }}>CURRENT STATE → </span>{g.real}
                      </div>
                      {/* Progress bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.55rem", color: "#333", letterSpacing: "0.15em" }}>DEVELOPMENT PROGRESS</span>
                          <span style={{ fontSize: "0.65rem", color: progressColor(g.progress), fontWeight: 700 }}>{g.progress}%</span>
                        </div>
                        <div style={{ height: "4px", background: "#111", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{
                            width: `${g.progress}%`, height: "100%",
                            background: `linear-gradient(90deg, ${progressColor(g.progress)}88, ${progressColor(g.progress)})`,
                            borderRadius: "2px",
                            boxShadow: `0 0 8px ${progressColor(g.progress)}66`,
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNTOUCHED */}
        {tab === "untouched" && (
          <div>
            <div style={{
              background: "#0a0000", border: "1px solid #ff2d5522",
              borderRadius: "4px", padding: "1rem 1.25rem", marginBottom: "1.5rem",
              boxShadow: "0 0 30px rgba(255,45,85,0.05)",
            }}>
              <div style={{ fontSize: "0.7rem", color: "#ff2d55", letterSpacing: "0.2em", marginBottom: "0.4rem" }}>
                ⚠ OPPORTUNITY BRIEF
              </div>
              <p style={{ color: "#666", fontSize: "0.75rem", lineHeight: 1.7, margin: 0 }}>
                These {gadgets.untouched.length} technologies have no meaningful real-world equivalent yet. First-mover advantage is wide open. Proceed with caution — each one is a Black Mirror episode waiting to happen.
              </p>
            </div>
            <div style={{ display: "grid", gap: "1rem" }}>
              {gadgets.untouched.map((g, i) => (
                <div key={i} style={{
                  background: "#080808", border: "1px solid #1a0000",
                  borderLeft: "3px solid #ff2d55",
                  borderRadius: "4px", padding: "1.25rem",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "0.75rem", right: "1rem",
                    fontSize: "0.55rem", color: "#ff2d5566", letterSpacing: "0.2em",
                    fontWeight: 700,
                  }}>
                    UNCLAIMED
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: "2rem", height: "2rem", borderRadius: "50%",
                      border: "1px solid #ff2d5533",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#ff2d55", fontSize: "0.8rem", fontWeight: 900, flexShrink: 0,
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.2rem", fontFamily: "'Arial Black', sans-serif" }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#ff2d55aa", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                        {g.episode}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.6 }}>
                        {g.idea}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "2rem", padding: "1.25rem",
              background: "#050505", border: "1px dashed #222",
              borderRadius: "4px", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.65rem", color: "#333", letterSpacing: "0.25em", marginBottom: "0.5rem" }}>
                END OF REPORT
              </div>
              <div style={{ fontSize: "0.75rem", color: "#444" }}>
                {gadgets.untouched.length} unexploited concepts · All sourced from Black Mirror canon
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

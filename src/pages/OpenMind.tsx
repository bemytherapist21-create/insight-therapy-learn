import { useEffect } from "react";

const OpenMind = () => {
  useEffect(() => {
    // Hide the navigation bar for full-screen experience
    const nav = document.querySelector("nav");
    if (nav) nav.style.display = "none";

    return () => {
      // Restore navigation when leaving
      if (nav) nav.style.display = "";
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        zIndex: 9999,
        backgroundColor: "#0a0a0f",
      }}
    >
      <iframe
        src="https://openmind.theeverythingai.com"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Open Mind AI"
        allow="clipboard-write"
      />
    </div>
  );
};

export default OpenMind;

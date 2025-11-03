module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#b8ff3d",    
        secondary: "#84f000",  
        accent: "#00ffa3",     
        background: "#0b0f14", 
        card: "#0f141a",       
        text: "#e6f1ff",       
        muted: "#94a3b8",    
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.4)",
        glow: "0 0 0 2px rgba(184,255,61,0.15), 0 20px 60px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        'grid-dots': "radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)",
        'radial-fade': "radial-gradient(800px 400px at 50% -10%, rgba(184,255,61,0.08), transparent)",
      },
      backgroundSize: {
        'grid-size': '22px 22px',
      },
      ringColor: {
        neon: '#b8ff3d',
      }
    },
  },
  plugins: [],
};

import { createContext, useContext } from "react";

const VizMotionContext = createContext({
  inView: true,
});

export function VizMotionProvider({ inView, children }) {
  return (
    <VizMotionContext.Provider value={{ inView: Boolean(inView) }}>
      {children}
    </VizMotionContext.Provider>
  );
}

export function useVizMotion() {
  return useContext(VizMotionContext);
}

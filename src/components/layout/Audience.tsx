"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { safeStorage } from "@/lib/useReducedMotion";

export type Audience = "business" | "students";
const Ctx = createContext<{ audience: Audience; setAudience: (a: Audience) => void }>({
  audience: "business",
  setAudience: () => {},
});

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [audience, set] = useState<Audience>("business");
  useEffect(() => {
    if (safeStorage.get("ck-audience") === "students") set("students");
  }, []);
  const setAudience = (a: Audience) => {
    set(a);
    safeStorage.set("ck-audience", a);
  };
  return <Ctx.Provider value={{ audience, setAudience }}>{children}</Ctx.Provider>;
}

export const useAudience = () => useContext(Ctx);

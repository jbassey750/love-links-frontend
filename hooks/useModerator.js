import { useContext } from "react";
import { ModeratorContext } from "../src/context/ModeratorContext";

export const useModerator = () => {
  const context = useContext(ModeratorContext);
  if (!context) {
    throw new Error("useModerator must be used within a ModeratorProvider");
  }
  return context;
};
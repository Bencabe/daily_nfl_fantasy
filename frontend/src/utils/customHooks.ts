import { useContext } from "react";
import { GlobalContext } from "../main";

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
      throw Error("Context must be used within a Provider");
    }
    return context;
  }
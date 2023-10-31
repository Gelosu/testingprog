import { useEffect } from "react";
import { createContext, useContext, useState } from "react";

const tupcidContext = createContext();

export default function Provider ({children}){
    const [tupcids, setTupcids] = useState("");

    useEffect(() => {
        const storedTupcids = localStorage.getItem('tupcids');
        if (storedTupcids) {
          setTupcids(storedTupcids);
        }
      }, []);
    
      useEffect(() => {
        localStorage.setItem('tupcids', tupcids);
      }, [tupcids]);

    return(
        <tupcidContext.Provider value={{tupcids,  setTupcids}}>
            {children}
        </tupcidContext.Provider>
    )
};

export const useTupcid = () => useContext(tupcidContext)

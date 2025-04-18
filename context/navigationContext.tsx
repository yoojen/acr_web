import { createContext, useContext, useState } from "react";

const NavigationContext = createContext<{
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ sidebarOpen: false, setSidebarOpen: () => { } });


export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return <NavigationContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        {children}
    </NavigationContext.Provider>
}



export const useSideBar = () => {
    return useContext(NavigationContext)
}
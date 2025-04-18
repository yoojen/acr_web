"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import MenuItemComponent from "./MenuItem";
import { SidebarProps } from "@/interface";
import { useAuth } from "@/context/authContext";
import withAuth from "@/HOC/withAuth";
import { requestAxios } from "@/api";



function Sidebar({ menuItems, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter()

  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      const response = await requestAxios.post("/users/auth/logout", {}, { withCredentials: true })
      if (response.status == 200) {
        auth.setUser({ email: '', firstName: '', lastName: '', role: '' })
        router.push("/admin/auth/login")
      }
    } catch (error) {
      if (error) {
        router.refresh()
      }
    }
  };

  return (
    <div
      className={`fixed h-full bg-gray-800 text-white transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-20"
        } z-40 shadow-xl`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white">
        <h1
          className={`text-2xl font-bold transition-opacity ${sidebarOpen ? "opacity-100" : "hidden"
            }`}
        >
          AdminPanel
          <hr />
          <span className="mt-4 text-sm space-x-2">
            <small>Welcome,</small>
            <small className="underline"> {auth.user.firstName} {auth.user.lastName}</small>
            {/* <small>{auth.user.role}</small> */}
          </span>
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-primary transition-colors"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <MenuItemComponent
              key={item.name}
              item={item}
              sidebarOpen={sidebarOpen}
              openSubMenu={openSubMenu}
              toggleSubMenu={toggleSubMenu}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="absolute p-3 bg-transparent w-full bottom-20 flex items-center hover:bg-primary transition-colors"
      >
        <FiLogOut size={20} className="mr-2" />
        {sidebarOpen && "Logout"}
      </button>
    </div>
  );
}
export default withAuth(Sidebar);

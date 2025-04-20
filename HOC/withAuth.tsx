"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { requestAxios } from "@/api";
import { ClipLoader } from "react-spinners";
import { useAuth } from "@/context/authContext";
import useSWR from "swr";

async function getme(url: string) {
    const response = await requestAxios.get(url, { withCredentials: true });
    return response.data;
}

function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
    return function ProtectedComponent(props: any) {
        const router = useRouter();
        const pathname = usePathname();
        const auth = useAuth();
        const hasRedirected = useRef(false);

        const { data, isLoading, error } = useSWR("/users/getme", getme, {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        });

        useEffect(() => {
            if (!isLoading && !error && data) {
                auth.setUser({
                    email: data.email,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    role: data.role,
                });
            }
        }, [data, isLoading, error]);

        useEffect(() => {
            if (error && !hasRedirected.current) {
                hasRedirected.current = true;
                localStorage.setItem("next", pathname);
                auth.setUser({ email: '', firstName: '', lastName: '', role: '' });
                router.replace("/admin/auth/login");
            }
        }, [error, router]);

        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <ClipLoader size={50} color="#3498db" />
                </div>
            );
        }

        if (!isLoading && auth.user.email) {
            return <WrappedComponent {...props} />;
        }

        return null;
    };
}

export default withAuth;
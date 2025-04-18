"use client";
import { useRouter } from "next/navigation"; // Use next/navigation in Next.js 13+ (app router)
import { CSSProperties, useEffect, useState } from "react";
import { requestAxios } from "@/api";
import { ClipLoader } from "react-spinners";
import { useAuth } from "@/context/authContext";
import useSWR from "swr";

async function getme(url: string) {
    const response = await requestAxios.get(url, { withCredentials: true })
    return response.data
}
function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
    return function ProtectedComponent(props: any) {
        const router = useRouter();
        const auth = useAuth()
        const { data, isLoading, error } = useSWR("/users/getme", getme)

        useEffect(() => {
            if (!isLoading && !error && data) {
                auth.setUser({
                    email: data.email,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    role: data.role
                })
            }
        }, [data, isLoading, error])

        useEffect(() => {
            if (error) {
                router.replace("/admin/auth/login");
            }
        }, [error, router]);


        if (!isLoading && auth.user.email) return <WrappedComponent {...props} />;

        return null;
    };
};

export default withAuth;

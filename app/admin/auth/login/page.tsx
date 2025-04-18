"use client";
import LoginInput from "@/components/LoginInput";
import assets from "@/public";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { requestAxios } from "@/api";
import { useRouter } from "next/navigation";
import { ApiResponseError } from "@/interface";

const Login = () => {
  // States
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  }>({ email: "", password: "" });
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const router = useRouter();

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Base cases
    if (!credentials.email || !credentials.password) return;
    if (!emailRegex.test(credentials.email)) {
      setEmailError("Invalid email");
      return;
    }
    if (credentials.password.length < 8 || credentials.password.length > 16) {
      setPasswordError("Password should be 8 to 16 characters");
      return;
    }

    // send request
    (async function () {
      try {
        setIsLoading(true)
        const response = await requestAxios.post("/users/auth/login", JSON.stringify(credentials), { withCredentials: true })

        if (response.status === 200) {
          const next = localStorage.getItem("next");
          setIsLoading(false)
          setEmailError("");
          setPasswordError("");
          if (next) {
            localStorage.removeItem("next");
            router.push(next);
          } else {
            router.push("/admin");
          }
        }
      } catch (error: unknown) {
        setIsLoading(false)
        if (error instanceof Error && (error as ApiResponseError).response?.data?.message) {
          setLoginError((error as ApiResponseError).response.data.message);
        } else {
          setLoginError("An error occurred. Please try again later.");
        }
      } finally {
        setIsLoading(false)
      }
    }())

  };

  const handleShowPassword = () => {
    setEmailError("");
    setShowPassword((prev) => !prev);
  };

  const loginContent = (
    <div className="my-4 px-5">
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="flex flex-col">
          <label htmlFor="email">Email</label>
          <LoginInput
            type="text"
            placeholder="example@gmail.com"
            keyToChange="email"
            setCredentials={setCredentials}
            setEmailError={setEmailError}
            setPasswordError={setPasswordError}
          />
          {emailError && (
            <span className="text-red-500 text-sm">{emailError}</span>
          )}
        </div>
        <div className="flex flex-col relative">
          <label htmlFor="password">Password</label>
          <LoginInput
            type={showPassword ? "text" : "password"}
            placeholder="password here..."
            keyToChange="password"
            setCredentials={setCredentials}
            setPasswordError={setPasswordError}
          />
          <small
            className="absolute right-2 top-1/2 cursor-pointer"
            onClick={handleShowPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </small>
          {passwordError && (
            <span className="text-red-500 text-sm">{passwordError}</span>
          )}
        </div>
        <div className="flex justify-end my-3 underline text-primary hover:opacity-80">
          <Link href={"/admin/auth/forget-password"}>Forget Password?</Link>
        </div>
        <div className="flex justify-center my-4">
          {isLoading && <button disabled>...</button>}
          {!isLoading && <button>Login</button>}
        </div>
      </form>
    </div>
  );


  return (
    <div className="w-3/4 md:w-1/2 lg:w-1/3 translate-y-2/5">
      <div className="flex items-center justify-center mb-20">
        <Image src={assets.Logo} alt="ACR Logo" width={230} height={95} />
      </div>
      <div className="bg-white rounded-sm shadow-sm p-3">
        <h2 className="text-center text-primary">LOGIN</h2>
        <hr />
        {loginError && (<div className="text-center my-4 text-red-500">{loginError}</div>)}
        {loginContent}
      </div>
    </div>
  );
};

export default Login;
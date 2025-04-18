"use client";
import { useEffect, useState, useMemo, FormEvent } from "react";
import Cookies from "universal-cookie";
import { AiOutlineClose } from "react-icons/ai";
import { requestAxios } from "@/api";
import useSWRMutation from "swr/mutation";


export async function subscribeToNewsLetter(url: string, { arg }: { arg: { email: string } }) {
  const response = await requestAxios.post(url, arg)
  return response.data;
}

const SubscribePopUp = () => {
  const cookies = useMemo(() => new Cookies(), []);
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { trigger: subscribeTrigger, isMutating } = useSWRMutation("/subscriptions/create-sub", subscribeToNewsLetter)


  useEffect(() => {
    const hasVisited = cookies.get("v_t");
    const timeout = setTimeout(() => {
      if (!hasVisited) {
        setIsPopupOpen(true);
      }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [cookies]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (error) {
        setError("")
      }
      if (message) {
        setMessage("")
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [error, message])


  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please provide an email")
      return;
    }

    try {
      await subscribeTrigger({ email })
      setEmail("")
      setMessage("You have successfully subscribed to our newsletter")
      setError("")
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).response) {
        setError((error as any).response.data.message)
      } else {
        setError("failed to subscribe")
      }
    }
  }

  const handleClose = () => {
    cookies.set("v_t", 1, { expires: new Date(Date.now() + 86400000) });
    setIsPopupOpen(false);
  };

  return (
    <>
      {isPopupOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-800 bg-opacity-20">
          <div className="w-1/3 bg-white rounded-3xl shadow-md p-5 space-y-4 relative">
            {error && <p className="text-red-500 text-sm my-5">{error}</p>}
            {message && <p className="text-sky-500 text-sm my-5">{message}</p>}

            <div className="flex items-center justify-between">
              <p className="text-md font-bold uppercase text-primary">
                Subscribe To Newsletter
              </p>
              <AiOutlineClose
                className="text-red-600 font-bold text-2xl cursor-pointer"
                onClick={handleClose}
              />
            </div>

            <form onSubmit={handleSubscribe} className="p-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 text-textLight placeholder-gray-400  shadow-sm bg-transparent text-lg font-normal leading-7 rounded-full border border-gray-200 focus:outline-none pl-4 mb-10"
              />

              <div className="flex justify-end mt-5">
                <button
                  disabled={isMutating}
                  className={`${isMutating ? 'cursor-not-allowed' : ''} bg-primary text-white px-4 py-2 rounded-md`}
                >
                  {isMutating ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscribePopUp;
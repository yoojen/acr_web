"use client";
import withAuth from "@/HOC/withAuth";
import components from "../components";
import { useEffect, useState } from "react";
import { ApiResponseError, Subscriber } from "@/interface";
import TiptapEditor from "@/components/TipTapEditor";
import { requestAxios } from "@/api";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import Paginate from "@/components/Paginate";



async function fetcher(url: string) {
  const response = await requestAxios.get(url)
  const { rows, ...metadata } = response.data.data;
  return { rows, metadata }
}


async function addSubscriber(url: string, { arg }: { arg: { email: string } }) {
  const response = await requestAxios.post(url, arg, { withCredentials: true })
  return response.data;
}

async function sendBlastMessage(url: string, { arg }: {
  arg: { content: string, subject: string }
}) {
  const response = await requestAxios.post(url, arg, { withCredentials: true })
  return response.data;
}

async function unsubscribeOrResubsctibe(url: string, { arg }: { arg: { email: string } }) {
  const response = await requestAxios.put(url, arg, { withCredentials: true })
  return response.data;
}

async function deleteSubscriber(url: string, { arg }: { arg: { id: string } }) {
  const response = await requestAxios.delete(`${url}/${arg.id}`, { withCredentials: true })
  return response.data;
}

function SubscriptionManagementPage() {
  const TableColumns = ["Email", "Subscribed", "Actions"]
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [newEmail, setNewEmail] = useState("");
  const [subject, setSubject] = useState("")
  const [blastMessage, setBlastMessage] = useState('<p></p>')
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false)
  let blastContent = ''

  const { data } = useSWR("/subscriptions", fetcher)
  const subscribers: Subscriber[] = data?.rows;
  const metadata = data?.metadata;
  const { trigger: addSubscriberTrigger, isMutating } = useSWRMutation("/subscriptions/create-sub", addSubscriber)
  const { trigger: unsubscribeTrigger } = useSWRMutation("/subscriptions/modify/unsubscribe", unsubscribeOrResubsctibe)
  const { trigger: resubscribeTrigger } = useSWRMutation("/subscriptions/modify/resubscribe", unsubscribeOrResubsctibe)
  const { trigger: deleteSubscriberTrigger } = useSWRMutation("/subscriptions/erase", deleteSubscriber)
  const { trigger: sendBlastTrigger, isMutating: blastMutation } = useSWRMutation("/contents/create-content", sendBlastMessage)



  useEffect(() => {
    const timeout = setTimeout(() => {
      setError("")
      setMessage("")
    }, 5000)
    return () => clearTimeout(timeout)
  }, [error, message])


  const handleAddSubscriber = async () => {

    // Creating new
    if (!newEmail) {
      setError("Please enter an email address");
      return;
    }
    const backup = [...subscribers]

    try {

      await addSubscriberTrigger({ email: newEmail })
      setMessage("Subscriber added successfully")
      setNewEmail("");
      mutate("/subscriptions")

    } catch (error: unknown) {
      if ((error as ApiResponseError)?.response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("Failed to create member")
      }
      mutate("/subscriptions", backup, false)
    }

    // setIsModalOpen(false);
  };

  const handleSendBlast = async () => {
    if (!blastMessage) {
      setError("Please enter a message");
      return;
    }

    try {
      await sendBlastTrigger({ content: blastMessage, subject: subject })
      setMessage("Blast message sent successfully")
      setBlastMessage("")
      setSubject("")
    } catch (error: unknown) {
      if ((error as ApiResponseError)?.response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("failed to send the blast")
      }
    }
  }

  const handleEdit = (subscriber: Subscriber) => {
    setNewEmail(subscriber.email)
    setIsModalOpen(true)
  }


  const handleUnsubscribeOrResubscribe = async (subscriber: Subscriber, action: string) => {

    if (action === "unsubscribe") {
      try {
        await unsubscribeTrigger({ email: subscriber.email })
        setMessage("Unsubscribed successfully");
        mutate("/subscriptions")
      } catch (error: unknown) {
        if ((error as ApiResponseError)?.response) {
          setError((error as ApiResponseError).response.data.message)
        } else {
          setError("Failed to unsubscribe")
        }
        mutate("/subscriptions")
      }
    }

    if (action === "resubscribe") {
      try {
        await resubscribeTrigger({ email: subscriber.email })
        setMessage("Unsubscribed successfully");
        mutate("/subscriptions")
      } catch (error: unknown) {
        if ((error as ApiResponseError)?.response) {
          setError((error as ApiResponseError).response.data.message)
        } else {
          setError("Failed to resubscribe")
        }
        mutate("/subscriptions")
      }
    }
  }


  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this subscriber?")) {
      const backup = [...subscribers]

      mutate("/subscriptions", backup?.filter((subscriber) => subscriber.id !== id), false);

      try {
        await deleteSubscriberTrigger({ id })
        setMessage("Subscriber deleted successfully")
        mutate("/subscriptions")
      } catch (error: unknown) {
        if ((error as ApiResponseError)?.response) {
          setError((error as ApiResponseError).response.data.message)
        } else {
          setError("failed to delete")
        }
        mutate("/subscriptions")
      }
    }
  };

  const handleContentChange = (content: string) => {
    blastContent += content
    setBlastMessage(blastContent)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Email Subscriptions</h1>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setIsBlastModalOpen(true)}
          className="bg-primary text-white px-4 py-2 mb-4"
        >
          Write Blast
        </button>
        <button
          onClick={() => {
            setNewEmail("")
            setIsModalOpen(true)
          }}
          className="bg-primary text-white px-4 py-2 mb-4"
        >
          Add Subscriber
        </button>
      </div>
      <div className="flex items-center space-x-2 my-4">
        <div className="border border-primary p-2">Total Subscribers</div>
        {metadata && <div
          className="flex justify-center items-center rounded-full p-3 bg-primary text-white w-10 h-10">
          {metadata.total_counts}
        </div>
        }
      </div>

      {
        (isModalOpen || isBlastModalOpen) &&
        <div className="absolute bg-slate-500 opacity-45 h-screen w-full top-0 left-0">
        </div>
      }

      {(!isModalOpen && !isBlastModalOpen) && (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {TableColumns.map((col, index) => (
                <th
                  key={index}
                  className={`${index === TableColumns.length - 1 ? 'text-right' : 'text-left'} px-4 py-2 border whitespace-nowrap`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscribers?.map((subscriber, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{subscriber.email}</td>
                <td className="border border-gray-300 px-4 py-2">{subscriber.is_subscribed ? "Yes" : "No"}</td>
                <td className="flex justify-end space-x-2 px-4 py-2 border">
                  <>
                    <p
                      className="text-slate-500 cursor-pointer"
                      onClick={() => subscriber.is_subscribed
                        ? handleUnsubscribeOrResubscribe(subscriber, "unsubscribe")
                        : handleUnsubscribeOrResubscribe(subscriber, "resubscribe")}
                    >
                      {
                        subscriber.is_subscribed
                          ? 'Unsubscribe'
                          : 'Resubscribe'
                      }
                    </p>
                    <span>|</span>
                  </>
                  <components.ActionButtons
                    onEdit={() => handleEdit(subscriber)}
                    onDelete={() => subscriber.id && handleDelete(subscriber.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {
        metadata && <Paginate
          total_page_items={metadata.total_page_items}
          total_pages={metadata.total_pages}
          current_page={metadata.current_page}
          previous_page={metadata.previous_page}
          next_page={metadata.next_page}
          setPageIndex={setPageIndex}
        />
      }

      {/* Adding Subscriber */}
      {
        isModalOpen && <components.Modal
          isOpen={isModalOpen}
          title="Add Subscriber"
          onClose={() => setIsModalOpen(false)}
        >
          {message && <small className="text-primary">{message} </small>}
          {error && <p className="text-red-500">{error}</p>}
          <components.InputField
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {
            isMutating
              ? <button disabled>Saving...</button>
              : <button onClick={handleAddSubscriber} className="mt-4">
                Save
              </button>
          }
        </components.Modal>
      }

      {/* Writing Blast */}
      <components.Modal
        isOpen={isBlastModalOpen}
        title="Write a blast"
        onClose={() => {
          setBlastMessage("")
          setSubject("")
          setIsBlastModalOpen(false)
        }}
      >
        {message && <small className="text-primary">{message} </small>}
        {error && <p className="text-red-500">{error}</p>}


        <div className="flex flex-col overflow-auto ">
          <div className="my-5">
            <components.InputField
              type="text"
              label="Subject"
              onChange={(e) => setSubject(e.target.value)}
              value={subject}
            />

          </div>
          <label htmlFor="bio">Description</label>
          <TiptapEditor
            onChange={handleContentChange}
            initialContent={blastMessage}
            isSubscription={true}
          />
        </div>
        {
          blastMutation
            ? <button disabled>Sending...</button>
            : <button onClick={handleSendBlast} className="mt-4">
              Send
            </button>
        }
      </components.Modal>
    </div>
  );
}

export default withAuth(SubscriptionManagementPage)
"use client"
import { requestAxios } from '@/api';
import ContactForm from '@/components/ContactForm'
import { ApiResponseError } from '@/interface';
import { useEffect, useState } from 'react'
import useSWRMutation from 'swr/mutation';

async function sendMessage(url: string, { arg }: { arg: Contact }) {
  const response = await requestAxios.post(url, arg)
  return response.data;
}

export interface Contact {
  names: string;
  email: string;
  phone: string;
  subject: string;
  comm_type: string;
  message: string;
}
const ContactUs = () => {
  const [data, setData] = useState<Contact>({
    names: "", email: "", phone: "", subject: "",
    comm_type: "email", message: ""
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const { trigger: sendMessageTrigger, isMutating } = useSWRMutation("/contact/send", sendMessage)


  useEffect(() => {
    const timeout = setTimeout(() => {
      if (message) {
        setMessage("")
      }
      if (error) {
        setError("")
      }
    }, 5000)
    return () => clearTimeout(timeout)
  }, [message, error])

  const handleOnChange = (field: string, value: string) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSendMessage = async () => {
    if (!data.names || !data.email || !data.phone || !data.subject || !data.comm_type || !data.message) {
      setError("Please fill all the fields")
      return;
    }

    try {

      await sendMessageTrigger(data)
      setMessage("Message sent successfully")
      setData({
        names: "", email: "", phone: "", subject: "",
        comm_type: "", message: ""
      })
    } catch (error: unknown) {
      if (error instanceof Error && (error as ApiResponseError).response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("failed to send message")
      }
    }
  }


  return (
    <div>
      <ContactForm
        data={data}
        message={message}
        error={error}
        isMutating={isMutating}
        handleOnChange={handleOnChange}
        setData={setData}
        handleSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default ContactUs

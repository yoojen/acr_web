"use client";
import assets from "@/public";
import Image from "next/image";
import ContactInfo from "./shared/ContactInfo";
import InputField from "./shared/InputField";
import { contactData } from "@/data";
import React, { Dispatch, SetStateAction } from "react";
import { Contact } from "@/app/contact/page";

function ContactUs({ data, isMutating, message, error, setData, handleOnChange, handleSendMessage }:
  {
    data: Contact,
    message: string,
    error: string;
    isMutating: boolean;
    setData: Dispatch<SetStateAction<Contact>>
    handleOnChange: (field: string, value: string) => void;
    handleSendMessage: () => void
  }) {
  // const [selectedMethod, setSelectedMethod] = useState("email");


  return (
    <section className="pt-32">
      <div className="flex flex-col lg:flex-row items-stretch gap-8">
        {/* Left Section */}
        <div className="flex flex-col lg:p-11 rounded-2xl lg:rounded-l-2xl w-full lg:w-1/2">
          <h2 className="text-primary font-bold mb-6 text-center">Contact us</h2>
          <div className="relative flex-1">
            <Image
              src={assets.Contact}
              alt="Contact"
              className="w-full h-full object-cover lg:rounded-l-2xl rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg p-4 shadow">
              {contactData.map((contact, index) => (
                <ContactInfo
                  key={index}
                  iconPath={contact.iconPath}
                  text={contact.text}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white p-5 lg:p-11 rounded-2xl lg:rounded-r-2xl w-full lg:w-1/2 flex flex-col justify-between">
          <h2 className="text-primary text-2xl font-bold mb-6">Send Us A Message</h2>
          {error && <p className="text-red-500 my-5">{error}</p>}
          {message && <p className="text-sky-500 my-5">{message}</p>}

          <InputField type="text" name="names" placeholder="Name" value={data.names} onChange={handleOnChange} />
          <InputField type="email" name="email" placeholder="Email" value={data.email} onChange={handleOnChange} />
          <InputField type="phone" name="phone" placeholder="Phone" value={data.phone} onChange={handleOnChange} />
          <InputField type="text" name="subject" placeholder="Subject" value={data.subject} onChange={handleOnChange} />
          <div className="flex items-center space-x-5 mb-5">
            <p>Preferred communication method</p>
            <div className="flex space-x-1">
              <input type="radio"
                name="preferredCom"
                checked={data.comm_type === "email" ? true : false}
                onChange={() => setData({ ...data, comm_type: "email" })}
              />
              <label
                htmlFor="emailChoice"
                className="flex items-center cursor-pointer text-textLight text-base font-normal leading-6"
              >Email</label>
            </div>
            <div className="flex space-x-1">
              <input
                type="radio"
                name="preferredCom"
                checked={data.comm_type === "phone" ? true : false}
                onChange={() => setData({ ...data, comm_type: "phone" })}
              />
              <label
                htmlFor="phoneChoice"
                className="flex items-center cursor-pointer text-textLight text-base font-normal leading-6"
              >Phone</label>
            </div>
          </div>

          <textarea
            className="w-full h-24 text-gray-600 placeholder-gray-400 shadow-sm bg-transparent text-lg font-normal leading-7 rounded-lg border border-gray-200 focus:outline-none p-4 mb-6"
            placeholder="Message"
            onChange={(e) => setData({ ...data, message: e.target.value })}
            value={data.message}
          />
          <button
            disabled={isMutating}
            className="bg-primary text-white px-6 py-3 rounded-full w-full"
            onClick={handleSendMessage}
          >
            {isMutating ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </section >
  );
}

export default ContactUs;
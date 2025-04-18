import { Contact } from "@/app/contact/page";
import { preferredMethods } from "@/data";
import { Dispatch, SetStateAction } from "react";



interface PreferredCommunicationProps {
  data: Contact;
  setData: Dispatch<SetStateAction<Contact>>
}

const PreferredCommunication = ({
  data,
}: PreferredCommunicationProps) => (
  <div className="mb-10">
    <h4 className="mb-4">Preferred method of communication</h4>
    <div className="flex space-x-5">
      {preferredMethods.map((method, index) => (
        <div className="flex space-x-1" key={index}>
          <input
            type="radio"
            name="preferredCom"
            checked={data.comm_type === method.value ? true : false}
            onChange={() => { }}
          />
          <label
            htmlFor="phoneChoice"
            className="flex items-center cursor-pointer text-textLight text-base font-normal leading-6"
          >{method.label}</label>
        </div>
      ))}
    </div>
  </div>
);

export default PreferredCommunication

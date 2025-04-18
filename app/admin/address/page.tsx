"use client";
import { useEffect, useState } from "react";
import components from "../components";
import { Address } from "@/interface";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { requestAxios } from "@/api";
import Image from "next/image";
import { uploadBase64Image } from "../team/page";
import withAuth from "@/HOC/withAuth";


async function fetcher(url: string) {
  const response = await requestAxios.get(url);
  return response.data.data
}


async function addAddress(url: string, { arg }: { arg: Address }) {
  const response = await requestAxios.post(url, arg, { withCredentials: true });
  return response.data.data;
}

async function updateAddress(url: string, { arg }: { arg: Address }) {
  delete arg.id
  const response = await requestAxios.put(`${url}`, arg, { withCredentials: true });
  return response.data.data;
}

async function deleteAddress(url: string) {
  const response = await requestAxios.delete(url, { withCredentials: true });
  return response.data.data;
}

function AddressManagementPage() {
  const TableColumns = ["Image", "Name", "Description", "Main Address", "Nearest", "Email", "Phone", "Lat", "Lon", "Actions"]
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [error, setError] = useState("");
  const [message, setMessage] = useState("")
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Address>({
    id: "",
    company_name: "", company_description: "", company_address: "", company_nearest_address: "",
    company_email: "", company_phone: "", lat: "", lon: "", company_logo_url: ""
  });

  const { data: address, error: fetchError, isLoading } = useSWR<Address>("/company", fetcher)
  const { trigger: addAddressTrigger, isMutating } = useSWRMutation("/company/create", addAddress)
  const { trigger: updateAddressTrigger } = useSWRMutation("/company/modify", updateAddress)
  const { trigger: deleteAddressTrigger } = useSWRMutation("/company/erase", deleteAddress)


  useEffect(() => {
    const timeout = setTimeout(() => {
      setError("")
      setMessage("")
    }, 5000)
    return () => clearTimeout(timeout);
  }, [error, message])


  const handleAddAddress = async () => {
    if (
      !newAddress.company_logo_url || !newAddress.company_name || !newAddress.company_description ||
      !newAddress.company_address || !newAddress.company_nearest_address || !newAddress.company_email ||
      !newAddress.company_phone || !newAddress.lat || !newAddress.lon
    ) {
      setError("All address fields are required!");
      return;
    }

    if (currentAddress) {
      // update
      mutate("/company", newAddress, false)

      try {

        if (newAddress.company_logo_url instanceof File) {
          const image_url = await uploadBase64Image("/company/upload-logo", newAddress.company_logo_url);
          newAddress.company_logo_url = image_url;
        }

        // Actual API call
        await updateAddressTrigger(newAddress)
        mutate("/company")
        setMessage("Address updated successfully")
        setError("")
        setNewAddress({
          id: "",
          company_name: "", company_description: "",
          company_address: "", company_nearest_address: "",
          company_email: "", company_phone: "",
          lat: "", lon: "", company_logo_url: ""
        });
        setCurrentAddress(null);
      } catch (error: unknown) {
        if (error instanceof Error && (error as any).response) {
          setError((error as any).response.data.message)
        } else {
          setError("Failed to update address")
        }
        mutate("/company")
      }
    } else {
      // add
      const backup = address && { ...address };
      mutate("/company", newAddress, false)

      try {

        if (newAddress.company_logo_url instanceof File) {
          const image_url = await uploadBase64Image("/company/upload-logo", newAddress.company_logo_url);
          newAddress.company_logo_url = image_url;
        } else {
          if (!newAddress.company_logo_url) {
            throw new Error("Invalid file type for company logo");
          }
        }

        // Actual API call
        delete newAddress.id
        await addAddressTrigger(newAddress)
        mutate("/company")

        setNewAddress({
          id: "",
          company_name: "", company_description: "",
          company_address: "", company_nearest_address: "",
          company_email: "", company_phone: "",
          lat: "", lon: "", company_logo_url: ""
        });
        setError("")
        setMessage("Address added successfully!");
      } catch (error: unknown) {
        if (error instanceof Error && (error as any).response) {
          setError((error as any).response.data.message)
        } else {
          setError("Failed to create member")
        }
        mutate("/company", backup, false)
      }
    }
    // setIsModalOpen(false);
  };

  const handleEditAddress = (addresses: Address) => {
    setIsModalOpen(true);
    setNewAddress(addresses);
    setCurrentAddress(addresses);
  };

  const handleDeleteAddress = async () => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      mutate("/company", {}, false)

      try {
        await deleteAddressTrigger()
        setMessage("Deleted successfully")
        setError("")
        mutate("/company")
      } catch (error: unknown) {
        if (error instanceof Error && (error as any).response) {
          setError((error as any).response.data.message)
          setMessage("")
        } else {
          setError("Failed to create member")
          setMessage("")
        }
        mutate("/company")
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64string = reader.result as string;
        setPreviewImage(base64string);
      }
      reader.readAsDataURL(file);
      setNewAddress({ ...newAddress, company_logo_url: file, });
    }
  };
  const addressFields = [
    { label: "Company Name", field: "company_name" },
    { label: "Company Description", field: "company_description" },
    { label: "Main Address", field: "company_address" },
    { label: "Nearest", field: "company_nearest_address" },
    { label: "Email", field: "company_email" },
    { label: "Phone", field: "company_phone" },
    { label: "Lat", field: "lat" },
    { label: "Lon", field: "lon" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Addresses</h1>

      <button
        onClick={() => {
          setIsModalOpen(true);
          setNewAddress({
            id: "",
            company_name: "", company_description: "",
            company_address: "", company_nearest_address: "",
            company_email: "", company_phone: "",
            lat: "", lon: "", company_logo_url: ""
          });
        }}
        className="bg-blue-600 text-white px-4 py-2 mb-4 rounded hover:bg-blue-700 transition-colors"
      >
        Add Address
      </button>
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
          {!isLoading && !fetchError && address && (
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                {typeof address?.company_logo_url === "string" &&
                  <Image
                    src={`https://api.accountants.co.rw${address.company_logo_url}`}
                    alt={address.company_name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                }
              </td>
              <td className="border border-gray-300 px-4 py-2">{address.company_name}</td>
              <td className="border border-gray-300 px-4 py-2">{address.company_description}</td>
              <td className="border border-gray-300 px-4 py-2">{address.company_address}</td>
              <td className="border border-gray-300 px-4 py-2">{address.company_nearest_address}</td>
              <td className="border border-gray-300 px-4 py-2">{address.company_email}</td>
              <td className="border border-gray-300 px-4 py-2">{address.company_phone}</td>
              <td className="border border-gray-300 px-4 py-2">{address.lat}</td>
              <td className="border border-gray-300 px-4 py-2">{address.lon}</td>
              <td className="border border-gray-300 px-4 py-2">
                <components.ActionButtons
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => address.id && handleDeleteAddress()}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && <div className="fixed bg-slate-500 opacity-45 h-screen w-full top-0 left-0"></div>}
      <components.Modal
        isOpen={isModalOpen}
        title={currentAddress ? "Edit Address" : "Add Address"}
        onClose={() => {
          setIsModalOpen(false);
          setNewAddress({
            id: "",
            company_name: "", company_description: "", company_address: "",
            company_nearest_address: "",
            company_email: "", company_phone: "", lat: "", lon: "",
            company_logo_url: ""
          });
        }}
      >
        {/* Display error / Message */}
        {message && <small className="text-primary">{message} </small>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="my-5">
          <div className="mb-7">
            <label htmlFor="logo">Company Logo</label>
            <input
              key='logo'
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="p-2 w-full rounded border"
            />

            <div className="mt-7">
              {(previewImage || address?.company_logo_url) && (
                <div className="mb-4 flex justify-center">
                  <Image
                    src={previewImage || `https://api.accountants.co.rw${address?.company_logo_url}`}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-full"
                    width={128}
                    height={128}
                  />
                </div>
              )}
            </div>
          </div>

          {addressFields.map(({ label, field }) => (
            <components.InputField
              key={field}
              type="text"
              label={label}
              value={newAddress[field as never] || ""}
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  [field]: e.target.value,
                })
              }
            />
          ))}
        </div>
        {
          isMutating
            ? <button disabled>Creating...</button>
            : currentAddress ? <button onClick={handleAddAddress}>Update</button>
              : <button onClick={handleAddAddress}>Save</button>
        }

      </components.Modal>
    </div>
  );
}

export default withAuth(AddressManagementPage)
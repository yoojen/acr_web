"use client";
import Image from "next/image";
import components from "../components";
import withAuth from "@/HOC/withAuth";
import { useEffect, useState } from "react";
import { ACRTeamObject, ApiResponseError } from "@/interface";
import { useSideBar } from "@/context/navigationContext";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { requestAxios } from "@/api";
import Link from "next/link";
import { uploadBase64Image } from "@/utils/upload_utils";


async function fetcher(url: string) {
  const response = await requestAxios.get(url)
  return response.data.data;
}

async function addTeamMember(url: string, { arg }: { arg: ACRTeamObject }) {
  const response = await requestAxios.post(url, arg, { withCredentials: true });
  return response.data;
}


async function updateTeamMember(url: string, { arg }: { arg: ACRTeamObject }) {
  const { id, ...updatedData } = arg;
  const response = await requestAxios.put(`${url}/${id}`, updatedData, { withCredentials: true });
  return response.data;
}


async function deleteTeamMember(url: string, { arg }: { arg: { id: string } }) {
  const response = await requestAxios.delete(`${url}/${arg.id}`, { withCredentials: true })
  return response.data;
}


function TeamManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const [currentMember, setCurrentMember] = useState<ACRTeamObject | null>(null);
  const [newMember, setNewMember] = useState<ACRTeamObject>({
    id: "", image_url: "", first_name: "", last_name: "", position: "",
    tel: "", email: "", description: "",
    twitter_url: "", linkedin_url: "", instagram_url: "",
  });
  const { sidebarOpen } = useSideBar()

  /////////////////////////////////////////
  const TableColumns = ['Image', 'First Name', 'Last Name', 'Title', 'Email', 'Phone', 'Description', 'Social Media', 'Actions']
  const { data: teamMembers, error: fetchError, isLoading } = useSWR<ACRTeamObject[]>("/team-info", fetcher)
  const { trigger: addTeamMemberTrigger } = useSWRMutation("/team-info/create", addTeamMember)
  const { trigger: deleteMemberTrigger } = useSWRMutation("/team-info/erase", deleteTeamMember)
  const { trigger: updateTeamMemberTrigger } = useSWRMutation("/team-info/modify", updateTeamMember)


  // make error message disappear
  useEffect(() => {
    const timeout = setTimeout(() => {
      setError("")
      setMessage("")
    }, 5000)
    return () => clearTimeout(timeout)
  }, [error, message])

  const handleSave = async () => {

    if (!newMember.first_name || !newMember.last_name || !newMember.email || !newMember.tel || !newMember.image_url
      || !newMember.position || !newMember.description) {
      setError("Fill required fields");
      return;
    }

    if (currentMember) {
      const backup = teamMembers ? [...teamMembers] : [];

      mutate("/team-info", teamMembers?.map((member => member.id === newMember.id ? newMember : member)), false)
      try {
        if (newMember.image_url instanceof File) {
          const image_url = await uploadBase64Image("/team-info/upload-profile-image", newMember.image_url);
          newMember.image_url = image_url;
        }
        await updateTeamMemberTrigger(newMember);
        mutate("/team-info")
        setMessage("Updated successfully")
        setIsModalOpen(false);
      } catch (error: unknown) {
        if (error instanceof Error && (error as ApiResponseError).response) {
          setError((error as ApiResponseError).response.data.message)
        } else {
          setError("Failed to update member")
        }
        mutate("/team-info", backup, false)
      }
    } else {
      const backup = teamMembers ? [...teamMembers] : []
      mutate("/team-info", teamMembers ? [...teamMembers, newMember] : [newMember], false)
      try {

        if (newMember.image_url instanceof File) {
          const image_url = await uploadBase64Image("/team-info/upload-profile-image", newMember.image_url);
          newMember.image_url = image_url;
        } else {
          if (!newMember.image_url) {
            throw new Error("Invalid image file");
          }
        }

        delete newMember.id
        await addTeamMemberTrigger(newMember)
        mutate("/team-info");
        setNewMember({
          id: "", image_url: "", first_name: "",
          last_name: "", position: "", tel: "", email: "",
          description: "", twitter_url: "", linkedin_url: "", instagram_url: "",
        });
        setPreviewImage("")
        setIsModalOpen(false);
      } catch (error: unknown) {
        if (error instanceof Error && (error as ApiResponseError).response) {
          setError((error as ApiResponseError).response.data.message)
        } else {
          setError("Failed to create member")
        }
        mutate("/team-info", backup, false)
      }
    }
  };

  const handleEdit = (member: ACRTeamObject) => {
    setIsModalOpen(true);
    setCurrentMember(member);
    setNewMember(member);
  };


  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      mutate("/team-info", teamMembers?.filter((member) => member.id !== id), false);

      try {
        await deleteMemberTrigger({ id })
        setMessage("Member deleted successfully")
        mutate("/team-info")
      } catch (error: unknown) {
        if (error instanceof Error && (error as ApiResponseError).response) {
          setError((error as ApiResponseError).response.data.message)
        } else {
          setError("failed to delete")
        }
        mutate("/team-info", teamMembers, false)
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
      setNewMember({ ...newMember, image_url: file, });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Team Members</h1>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={() => {
          setIsModalOpen(true);
          setNewMember({
            id: "", image_url: "",
            first_name: "", last_name: "", position: "", tel: "", email: "",
            description: "", twitter_url: "", linkedin_url: "", instagram_url: "",
          });
        }}
        className="bg-blue-600 text-white px-4 py-2 mb-4 rounded hover:bg-blue-700 transition-colors"
      >
        Add Member
      </button>

      <table className="table-auto min-w-full border-collapse">
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
          {!fetchError && !isLoading && teamMembers?.map((member, index) => (
            <tr key={index}>
              <td className="px-4 py-2 border">
                {typeof member.image_url === "string" && <Image
                  src={`https://api.accountants.co.rw${member.image_url}`}
                  alt={member.first_name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                }
              </td>
              <td className="px-4 py-2 border">{member.first_name}</td>
              <td className="px-4 py-2 border">{member.last_name}</td>
              <td className="px-4 py-2 border">{member.position}</td>
              <td className="px-4 py-2 border">{member.email}</td>
              <td className="px-4 py-2 border">{member.tel}</td>
              <td className="px-4 py-2 border">{member.description.substring(0, 50)}...</td>
              <td className="px-4 py-2 border">
                <div className="flex space-x-2">
                  {member.twitter_url && (
                    <Link href={member.twitter_url} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </Link>
                  )}
                  {member.linkedin_url && (
                    <Link href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </Link>
                  )}
                  {member.instagram_url && (
                    <Link href={member.instagram_url} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </Link>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 border">
                <components.ActionButtons
                  onEdit={() => handleEdit(member)}
                  onDelete={() => member.id && handleDelete(member.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && <div className="absolute bg-slate-500 opacity-45 h-screen w-full top-0 left-0"></div>}
      <components.Modal
        isOpen={isModalOpen}
        title={currentMember ? "Edit Team Member" : "Add Team Member"}
        sidebarOpen={sidebarOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewMember({
            id: "", image_url: "", first_name: "",
            last_name: "", position: "", tel: "", email: "",
            description: "", twitter_url: "", linkedin_url: "", instagram_url: "",
          });
        }}
      >
        {message && <small className="text-primary">{message} </small>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="p-2 w-full rounded border"
            />
          </div>

          {previewImage && (
            <div className="mb-4 flex justify-center">
              <Image
                src={previewImage}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-full"
                width={128}
                height={128}
              />
            </div>
          )}

          {(["first_name", "last_name", "position", "tel", "email"] as Array<keyof ACRTeamObject>).map((field) => (
            <components.InputField
              key={field}
              type="text"
              label={field}
              value={typeof newMember[field] === "string" ? newMember[field] : ""}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  [field]: e.target.value,
                })
              }
            />
          ))}
          {(["twitter_url", "linkedin_url", "instagram_url"] as Array<keyof ACRTeamObject>).map((platform) => (
            <components.InputField
              key={platform}
              type="text"
              label={platform}
              value={typeof newMember[platform] === "string" ? newMember[platform] : ""}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  [platform]: e.target.value
                })
              }
            />
          ))}
          <div className="md:col-span-2">
            <components.TextArea
              label="Description"
              value={newMember.description}
              name="description"
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  description: e.target.value,
                })
              }
              required={true}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button

            onClick={handleSave}
          >
            {currentMember ? "Update" : "Save"}
          </button>
        </div>
      </components.Modal>
    </div>
  );
}

export default withAuth(TeamManagementPage)
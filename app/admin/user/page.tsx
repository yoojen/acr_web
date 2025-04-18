"use client";
import { AiFillEdit } from "react-icons/ai";
import components from "../components";
import { requestAxios } from "@/api";
import withAuth from "@/HOC/withAuth";
import { ApiResponseError, User } from "@/interface";
import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation"


async function fetcher(url: string) {
  const response = await requestAxios.get(url)
  return response.data.data;
}


async function addUser(url: string, { arg }: { arg: User }) {
  const response = await requestAxios.post(url, arg, { withCredentials: true });
  return response.data;
}


async function updateUser(url: string, { arg }: { arg: User }) {
  const { first_name, last_name, email } = arg;
  const response = await requestAxios.put(url, { first_name, last_name, email }, { withCredentials: true });
  return response.data;
}

async function updateUserRole(url: string, { arg }: { arg: { role: string, user: User } }) {
  const response = await requestAxios.put(`${url}/${arg.user.id}`, arg, { withCredentials: true })
  return response.data;
}


async function setActiveOrInactive(url: string, { arg }: { arg: { status: string, user: User } }) {
  const response = await requestAxios.put(`${url}/${arg.user.id}`, arg, { withCredentials: true })
  return response.data;
}

async function deleteUser(url: string, { arg }: { arg: { id: string } }) {
  const response = await requestAxios.delete(`${url}/${arg.id}`, { withCredentials: true })
  return response.data;
}


const UserManagement = () => {
  const TableColumns = ["First Name", "Last Name", "Email", "Is Active", "Role", "Actions"]
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("")
  const [newUser, setNewUser] = useState<User>({
    id: "", is_active: false, first_name: "",
    last_name: "", email: "", role: { name: "editor" },
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const userFields = [
    { label: "First Name", field: "first_name" },
    { label: "Last Name", field: "last_name" },
    { label: "Email", field: "email" },
    { label: "Password", field: "password" },
  ];

  const { data: users, error: fetchError, isLoading } = useSWR<User[]>("/users", fetcher)
  const { trigger: addUserTrigger } = useSWRMutation("/users/auth/register", addUser)
  const { trigger: updateUserTrigger } = useSWRMutation("/users/modify/update-user", updateUser)
  const { trigger: updateUserRoleTrigger } = useSWRMutation("/users/modify/update-role", updateUserRole)
  const { trigger: setActiveOrInactiveTrigger } = useSWRMutation("/users/user-status", setActiveOrInactive)
  const { trigger: deleteUserTrigger } = useSWRMutation("/users/erase", deleteUser)


  useEffect(() => {
    const timeout = setTimeout(() => {
      if (message) {
        setMessage("");
      }
      if (error) {
        setError("")
      }
    }, 3000);
    return () => clearTimeout(timeout)
  }, [error, message])


  const handleAddUser = async () => {
    try {
      if (newUser.id) {
        // Update existing user
        mutate("/users", !isLoading && users && users?.map(user => user.id === newUser.id ? newUser : user), false)

        await updateUserTrigger(newUser)
        setMessage("User updated successfully");
        setError("")
        setNewUser({
          id: "", is_active: false, first_name: "",
          last_name: "", email: "", role: { name: "" },
        });
        mutate("/users")
      } else {
        // Create new user
        mutate("/users", users && [...users, newUser], false)

        delete newUser.id
        await addUserTrigger(newUser)
        setMessage("User created successfully");
        setError("")
        setNewUser({
          id: "", is_active: false, first_name: "",
          last_name: "", email: "", role: { name: "" },
        });
        mutate("/users")
      }

      // setIsModalOpen(false);

    } catch (error: unknown) {
      if (error instanceof Error && (error as ApiResponseError).response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("Failed to create user")
      }
      mutate("/users")
    }
  };

  const handleEdit = (user: User) => {
    setNewUser(user);
    setIsModalOpen(true);
    setMessage("");
    setError("");
  };


  const handleUpdateRole = async () => {
    if (newUser.role.name === newRole) {
      setError("Role can't be the same")
      return;
    }

    try {
      await updateUserRoleTrigger({ role: newRole, user: newUser })
      setMessage("Role updated successfully")
      setError("")
      setNewUser({
        id: "", is_active: false, first_name: "",
        last_name: "", email: "", role: { name: "" },
      });
      mutate("/users")

    } catch (error: unknown) {
      if (error instanceof Error && (error as ApiResponseError).response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("Failed to update user")
      }
      mutate("/users")
    }
  }

  const handleFlagActiveOrInactive = async (user: User, action: string) => {
    try {
      if (action === "active") {
        await setActiveOrInactiveTrigger({ status: "active", user: user })
        setMessage("User activated successfully");
        setError("")
        mutate("/users")
      }
      if (action === "inactive") {
        await setActiveOrInactiveTrigger({ status: "inactive", user: user })
        setMessage("User disactivated successfully");
        setError("")
        mutate("/users")
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error as ApiResponseError).response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("Failed to update user")
      }
      mutate("/users")
    }
  }


  const handleDelete = async (userId: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete user ${userId}?`
    );
    if (!confirmDelete) return;

    mutate("/users", users?.filter(user => user.id !== userId), false)

    try {
      await deleteUserTrigger({ id: userId });
      setMessage("User deleted successfully");
      setError("")
      mutate("/users")
    } catch (error: unknown) {
      if (error instanceof Error && (error as ApiResponseError).response) {
        setError((error as ApiResponseError).response.data.message)
      } else {
        setError("Failed to create member")
      }
      mutate("/users")
    }
  };




  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      {message && <div className="text-sky-500 mb-4">{message}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Add User
      </button>

      <table className={`${(isModalOpen || isRoleModalOpen) ? 'opacity-5' : ''} table-auto w-full border-collapse border border-gray-300`}>
        <thead>
          <tr>
            {TableColumns.map((column, index) => (
              <th key={index} className={`${column === "Action" ? 'text-right' : 'text-left'}border border-gray-300 px-4 py-2`}>{column}</th>
            ))}

          </tr>
        </thead>
        <tbody>
          {!fetchError && !isLoading && users instanceof Array ? users.map((user) => (
            <tr key={user.id}>
              <td className="border border-gray-300 px-4 py-2">{user.first_name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.last_name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">{user.is_active ? 'Active' : 'Inactive'}</td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex items-center justify-center space-x-3 relative">
                  <p>
                    {user.role.name === process.env.NEXT_PUBLIC_ACR_EDITOR ? 'Editor' : 'Admin'}
                  </p>
                  <AiFillEdit
                    className="text-sky-500 cursor-pointer hover:opacity-80 border peer"
                    onClick={() => {
                      setNewUser(user);
                      setNewRole(user.role.name)
                      setIsRoleModalOpen(true);
                    }}
                  />
                  <span className="md:peer-hover:block hidden absolute -top-6 right-0 z-20 group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                    Edit Role
                  </span>
                </div>
              </td>
              <td className="flex justify-end space-x-2 px-4 py-2 border">
                <>
                  <p
                    className="text-slate-500 cursor-pointer"
                    onClick={() => user.is_active
                      ? handleFlagActiveOrInactive(user, "inactive")
                      : handleFlagActiveOrInactive(user, "active")}
                  >
                    {
                      user.is_active
                        ? 'Flag Inactive'
                        : 'Make Active'
                    }
                  </p>
                  <span>|</span>
                </>
                <components.ActionButtons
                  onEdit={() => handleEdit(user)}
                  onDelete={() => user.id && handleDelete(user.id)}
                />
              </td>
            </tr>
          ))
            : <tr></tr>
          }
        </tbody>
      </table>

      {(isModalOpen || isRoleModalOpen) &&
        <div className="absolute bg-slate-500 opacity-45 h-screen w-full top-0 left-0"></div>
      }

      {
        isRoleModalOpen && (
          <components.Modal
            isOpen={isRoleModalOpen}
            title="Update User Role"
            onClose={() => {
              setNewRole("")
              setMessage("")
              setError("")
              setNewUser({
                id: "", is_active: false, first_name: "",
                last_name: "", email: "", role: { name: "" },
              });
              setIsRoleModalOpen(false)
            }}
          >
            {error && <p className="text-red-500 my-4">{error}</p>}
            {message && <p className="text-sky-500 my-4">{message}</p>}

            <div>
              <div className="flex justify-end mt-4">
                <span className="font-bold">Update</span>: {newUser.first_name} {newUser.last_name}
              </div>

              <label
                className={`block mb-1 font-semibold text-gray-500 ml-1 transition-all duration-200 ease-in-out
              ${newUser.role ? "mt-2" : "-mt-6"} peer-focus:mt-2`}
              >
                Role
              </label>

              <select
                name="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="p-3 w-full rounded-md border-b border-gray-500 text-slate-600
                focus:outline-none transition-all duration-200 ease-in-out hover:border-gray-400"
              >
                <option value="">...</option>
                <option value={process.env._ACR_EDITOR}>Editor</option>
                <option value={process.env._ACR_ADMIN}>Admin</option>
              </select>

              <div className="flex justify-end my-2">
                <button onClick={handleUpdateRole}>Update</button>
              </div>

            </div>
          </components.Modal>
        )
      }
      <components.Modal
        isOpen={isModalOpen}
        title={newUser.id ? "Edit User" : "Add User"}
        onClose={() => {
          setIsModalOpen(false);
          setNewUser({
            id: "", is_active: false, first_name: "",
            last_name: "", email: "", role: { name: "" },
          });
          setMessage("");
          setError("");
        }}
      >
        {error && <p className="text-red-500 my-4">{error}</p>}
        {message && <p className="text-sky-500 my-4">{message}</p>}
        <div className="space-y-8">
          {userFields.map(({ label, field }) => {
            if (label === "Password" && newUser.id) {
              return null;
            }
            else {
              return <components.InputField
                key={field}
                type="text"
                label={label}
                value={String(newUser[field as keyof User] || "")}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    [field]: e.target.value,
                  })
                }
              />
            }

          }
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 my-2 rounded"
          >
            {newUser.id ? "Update" : "Save"}
          </button>
        </div>
      </components.Modal>
    </div>
  );
};

export default withAuth(UserManagement);

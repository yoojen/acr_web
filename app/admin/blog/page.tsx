"use client";
import { requestAxios } from "@/api";
import BlogCard from "@/components/BlogCard";
import BlogModal from "@/components/BlogModal";
import Paginate from "@/components/Paginate";
import withAuth from "@/HOC/withAuth";
import { uploadFile } from "@/utils/upload_utils";
import { FormEvent, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";



export interface blogList {
  id?: string;
  title: string;
  header_image_url: string;
  description: string;
  author?: string;
}

async function fetcher(url: string) {
  const response = await requestAxios.get(url, { withCredentials: true })
  const { rows, ...metadata } = response.data.data;
  return { rows, metadata }
}

async function addBlog(url: string, { arg }: { arg: blogList }) {
  const response = await requestAxios.post(url, arg, { withCredentials: true })
  return response.data;
}

async function updateBlog(url: string, { arg }: { arg: blogList }) {
  const { id, ...updatedObject } = arg;
  const response = await requestAxios.put(`${url}/${id}`, updatedObject, { withCredentials: true })
  return response.data;
}

async function deleteBlog(url: string, { arg }: { arg: { id: string } }) {
  const response = await requestAxios.delete(`${url}/${arg.id}`, { withCredentials: true })
  return response.data;
}


const Blog = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [creatingNewBlog, setCreatingNewBlog] = useState(false);
  const [headerImage, setHeaderImage] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ccc, setBlogContent] = useState("<p> </p>");
  const [error, setError] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [blogId, setBlogId] = useState("");
  const [pageIndex, setPageIndex] = useState(1)
  let blogContent = "";


  const { data, isLoading, error: swrError } = useSWR(`/blogs?page=${pageIndex}`, fetcher)
  const blogData: blogList[] = data?.rows;
  const blogMetadata = data?.metadata;
  const { trigger: addBlogTrigger } = useSWRMutation("/blogs/create-blog", addBlog)
  const { trigger: updateBlogTrigger } = useSWRMutation("/blogs/modify", updateBlog)
  const { trigger: deleteBlogTrigger } = useSWRMutation("/blogs/erase", deleteBlog)


  /* Scroll user back to where he was before editing*/
  useEffect(() => {
    if (!isEditing && scrollPosition !== 0) {
      window.scrollTo(0, scrollPosition);
    }
    if (isEditing != creatingNewBlog) {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isEditing, creatingNewBlog, scrollPosition]);

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


  /* THIS FUNCTION SETUP THINGS FOR EDITING BLOG */
  const onEdit = (id: string) => {
    setMessage("");
    setError("");

    const blog = blogData.find((blog) => blog.id === id);
    if (!blog) {
      setError("No blog selected!");
      return;
    }

    setScrollPosition(window.scrollY);
    if (blog) {
      blog.id && setBlogId(blog.id);
      setTitle(blog.title);
      setHeaderImage(blog.header_image_url);
      setBlogContent(blog.description);
      setIsEditing(true);
    }
  };

  /* THIS FUNCTION HANDLE BLOG DELETION */
  const onDelete = async (id: string) => {
    const yes = confirm(`Do you really want to delete this Blog: ${id}`);
    if (yes) {
      mutate("/blogs", blogData.filter(blog => blog.id !== id), false)

      try {
        await deleteBlogTrigger({ id })
        mutate("/blogs")
        setMessage("Blog Deleted!");
      } catch (error: unknown) {
        if (error instanceof Error && (error as any).response) {
          setError((error as any).response.data.message);
        } else {
          setError("failed to delete");
        }
        mutate("/blogs")
      }
    }
  };

  /* THIS FUNCTION TAKES CARE OF CONTENT */
  const handleDescriptionChange = (content: string) => {
    blogContent = content;
    setBlogContent(blogContent);
  };

  /* UPLOAD IMAGE TO SERVER*/
  const handleHeaderImageUpload = async (e: FormEvent) => {
    const target = e.target as HTMLInputElement;
    if (target && target.files && target.files[0]) {
      const file: File = target.files[0];

      const response = await uploadFile(file, "/blogs/create-blog-image") as {
        status: number;
        statusText: string;
        data: { image_url?: string }
      };

      if (response?.status === 201) {
        const data = await response.data;

        if (data.image_url) {
          const url = data.image_url;

          if (url) {
            setHeaderImage(url);
          }
        }
      }
    }
  };

  /*FUNCTION FOR CREATING OR UPDATING BLOG */
  const handleCreateOrEditBlog = async (e: FormEvent) => {
    e.preventDefault();

    try {

      const image_urls: string[] = [];
      const doc = new DOMParser().parseFromString(ccc, "text/html");
      doc.querySelectorAll("img").forEach((img) => {
        const imgPath = img.src.split("rw")[1];
        if (imgPath) image_urls.push(imgPath);
      });

      const payload = {
        id: blogId, title, description: ccc,
        header_image_url: headerImage, image_urls,
      };
      if (isEditing) {
        await updateBlogTrigger(payload)
        mutate("/blogs")
        setMessage("Blog updated successfully");
      }

      if (!isEditing) {
        mutate("/blogs", [...blogData, payload], false)
        await addBlogTrigger(payload)
        mutate("/blogs")
        setMessage("Blog created successfully");
      }

      blogContent = ""
      setBlogId("")
      setTitle("");
      setHeaderImage("");
      setBlogContent("");
      setError("");
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).response) {
        setError((error as any)?.response?.data?.message || "An unknown error occurred")
      } else {
        setError("failed to delete")
      }
      mutate("/blogs")
    }
  };


  return (
    <div>
      {(isEditing || creatingNewBlog) && (
        <BlogModal
          title={title}
          headerImage={headerImage}
          description={ccc}
          message={message}
          error={error}
          creatingNewBlog={creatingNewBlog}
          setTitle={setTitle}
          setIsEditing={setIsEditing}
          setCreatingNewBlog={setCreatingNewBlog}
          handleCreateOrBlogBlog={handleCreateOrEditBlog}
          handleHeaderImageUpload={handleHeaderImageUpload}
          handleDescriptionChange={handleDescriptionChange}
        />
      )}
      {!isEditing && !creatingNewBlog && (
        <div>
          <h3 className="text-center">Blogs</h3>
          {error && <small className="text-red-500 my-4 mx-5">{error}</small>}
          <div className="flex justify-end">
            <button
              className="my-5"
              onClick={() => {
                setTitle("");
                setHeaderImage("");
                setBlogContent("");
                setMessage("");
                setError("");
                setCreatingNewBlog(true);
              }}
            >
              Create Blog
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 [&>*]:mb-10 transition-all duration-1000 ease-in-out">
            {!isLoading && !error && blogData &&
              blogData.map((blog, idx) => {
                return (
                  <BlogCard
                    key={idx}
                    id={blog.id}
                    blog_header_img={blog.header_image_url}
                    title={blog.title}
                    description={blog.description}
                    author={blog.author}
                    isClient={false}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                );
              })}
          </div>
          {
            !isLoading && !error && blogMetadata &&
            <Paginate
              total_page_items={blogMetadata.total_page_items}
              total_pages={blogMetadata.total_pages}
              current_page={blogMetadata.current_page}
              previous_page={blogMetadata.previous_page}
              next_page={blogMetadata.next_page}
              setPageIndex={setPageIndex}
            />
          }
        </div>
      )}
    </div>
  );
};

export default withAuth(Blog);

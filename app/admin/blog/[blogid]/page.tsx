"use client";


import { useParams } from "next/navigation";
import withAuth from "@/HOC/withAuth";
import SingleBlog from "@/components/SingleBlog";



function BlogPost() {
  const params = useParams();
  const blogid = params.blogid as string;

  return (
    <SingleBlog blogid={blogid} />
  );
}

export default withAuth(BlogPost);
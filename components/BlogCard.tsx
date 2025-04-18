"use client";

import Image from "next/image";
import parse from "html-react-parser";
import Link from "next/link";
import HtmlParserOptions from "@/utils/htmlParser";

interface BlogCardProps {
  id: string;
  blog_header_img: string;
  title: string;
  description: string;
  author: string;
  isClient: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  blog_header_img,
  title,
  description,
  author,
  isClient,
  onEdit,
  onDelete,
}) => {

  return (
    <div className="border rounded-md shadow-lg overflow-scroll h-[250px] relative">

      {/* Header Image */}
      <div className="h-full flex">
        {blog_header_img && (
          <div className="h-full w-4/5 relative">
            <Image
              fill
              src={`https://api.accountants.co.rw${blog_header_img}`}
              alt="Blog Header"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="w-full flex flex-col justify-between  p-5">
          <div className="">
            {/* Buttons */}
            {
              !isClient && <div className="flex justify-end [&>*]:cursor-pointer">
                <p
                  onClick={() => onEdit && onEdit(id)}
                  className="px-4 py-2 text-blue-500  hover:underline"
                >
                  Edit
                </p>
                <p
                  onClick={() => onDelete && onDelete(id)}
                  className="px-4 py-2 text-red-500  hover:underline"
                >
                  Delete
                </p>
              </div>
            }
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-lg mb-2">Author: {author}</p>
            <div className="text-sm text-gray-600">
              {isClient
                ? parse(description.substring(0, 80), HtmlParserOptions)
                : parse(description.substring(0, 20), HtmlParserOptions)
              }...
              <span className="text-sky-500">
                <Link href={`${isClient ? `/resources/news/${id}` : `/admin/blog/${id}`}`}>readmore</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default BlogCard;

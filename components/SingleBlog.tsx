import parse from "html-react-parser";
import { requestAxios } from "@/api";
import HtmlParserOptions from "@/utils/htmlParser";
import Image from "next/image";
import useSWR from "swr";


interface BlogContent {
    header_image_url: string;
    author: string;
    description: string;
    title: string;
}

async function fetcher(url: string) {
    const response = await requestAxios.get(url)
    return response.data.data;
}

function SingleBlog({ blogid }: { blogid: string }) {
    const { data: blog, error, isLoading } = useSWR<BlogContent>(`/blogs/get/${blogid}`, fetcher)

    if (isLoading && !blog) {
        return <div className="text-center py-10">Loading blog post...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl mt-10">

            {
                blog && blog.author ? (
                    <>
                        <h1 className="text-3xl font-bold mt-10">{blog?.title}</h1>
                        <div className="w-full my-10 rounded-lg shadow-lg">
                            <Image
                                src={`https://api.accountants.co.rw${blog?.header_image_url as string}`}
                                alt={blog?.title || "Blog header image"}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                        <h4 className="text-gray-600 mb-6">Author: {blog?.author}</h4>
                        <div className="prose max-w-none">
                            {
                                blog?.description
                                    ? parse(blog.description, HtmlParserOptions)
                                    : "No content available"
                            }
                        </div>
                    </>
                ) :
                    <p>Failed to load blog, Refresh the page</p>
            }
        </div>
    );

}

export default SingleBlog;
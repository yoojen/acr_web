"use client"
import { requestAxios } from "@/api";
import BlogCard from "@/components/BlogCard";
import Paginate from "@/components/Paginate";
import Heading from "@/components/shared/Headings";
import { subscribeToNewsLetter } from "@/components/SubscribePopUp";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr"
import useSWRMutation from "swr/mutation";


interface Blog {
  id: string
  header_image_url: string;
  title: string;
  description: string;
  author: string;
}

async function blogFetcher(url: string) {
  const response = await requestAxios.get(url)
  const { rows, ...metadata } = response.data.data;
  return { rows, metadata };
}

const Page = () => {
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("");

  const { data } = useSWR("/blogs", blogFetcher)
  const blogs: Blog[] = data?.rows;
  const metadata = data?.metadata;
  const { trigger: subscribeTrigger, isMutating } = useSWRMutation("/subscriptions/create-sub", subscribeToNewsLetter)


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


  const handleSubscribe = async () => {
    if (!email) {
      setError("Please provide an email")
      return;
    }

    try {
      await subscribeTrigger({ email })
      setEmail("")
      setMessage("You have successfully subscribed to our newsletter")
      setError("")
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).response) {
        setError((error as any).response.data.message)
      } else {
        setError("failed to subscribe")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Modern Blog | Home</title>
        <meta
          name="description"
          content="A modern blog built with Next.js, TypeScript, and Tailwind CSS"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {error && <p className="bg-red-500 text-white p-5 my-5">{error}</p>}
          {message && <p className="text-green-500 my-5">{message}</p>}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Inspiring Stories
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join our community of readers and writers sharing unique
            perspectives on technology, design, and creativity.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex rounded-md shadow-sm">
              <input
                type="email"
                value={email}
                placeholder="Enter your email address"
                onChange={(e) => setEmail(e.target.value)}
                className="text-black flex-1 px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isMutating}
                className={`${isMutating ? 'cursor-not-allowed' : ''} bg-pink-500 text-white px-6 py-3 rounded-r-md hover:bg-pink-600 transition duration-300 ease-in-out`}
                onClick={handleSubscribe}
              >
                {isMutating ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="my-5 bg-white p-10">
        <Heading
          title="Latest News"
          subtitle="Stay updated with the latest insights, updates, and expert advice from ACR Online Accounting Services."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 [&>*]:mb-10 md:mx-40">
          {blogs?.map((blog, index) => (
            <BlogCard
              key={index}
              id={blog.id}
              blog_header_img={blog.header_image_url}
              title={blog.title}
              description={blog.description}
              author={blog.author}
              isClient={true}
            />
          ))}
        </div>
        {/* Pagination */}
        {
          metadata && <Paginate
            total_page_items={metadata.total_page_items}
            total_pages={metadata.total_pages}
            current_page={metadata.current_page}
            previous_page={metadata.previous_page}
            next_page={metadata.next_page}
            requestURL={"/blogs"}
          />
        }
      </div>
    </div>
  );
};

export default Page;

"use client";
import { requestAxios } from "@/api";
import useSWR from "swr";
import Link from "next/link";
import withAuth from "@/HOC/withAuth";
import { ImNewTab } from "react-icons/im";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import RecentActivites from "@/components/RecentActivities";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


export interface blogContent {
  author: string;
  created_at: string;
  description: string;
  header_image_url: string;
  id: string;
  title: string;
}

export interface contentData {
  id: string;
  created_by: string;
  content: string;
  user: { first_name: string, last_name: string };
  created_at: string;
}

async function fetcher(url: string) {
  const response = await requestAxios.get(url, { withCredentials: true })
  return response.data;
}

function AdminHome() {
  const subFrequency = [];
  const monthYear = [];
  const { data: subs, isLoading: subLoading, error: subError } = useSWR("/subscriptions", fetcher)
  const { data: users, isLoading: userLoading, error: userError } = useSWR("/users", fetcher)
  const { data: blogs, isLoading: blogLoading, error: blogError } = useSWR("/blogs", fetcher)
  const { data: content, isLoading: contentLoading, error: contentError } = useSWR("/contents", fetcher)
  const { data: contact } = useSWR("/contact/count", fetcher)
  const { data: lineData, isLoading: lineLoading, error: lineError } = useSWR("/subscriptions/line-chart", fetcher)


  if (!lineLoading && !lineError) {
    for (const item of lineData.data) {
      subFrequency.push(item.count);
      monthYear.push(`${item.month}/${item.year}`);
    }
  }

  const data = {
    labels: !lineLoading && !lineError ? monthYear : [],
    datasets: [
      {
        label: 'Total Subscribers',
        data: !lineLoading && !lineError ? subFrequency : [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Subscribers Growth Per Week',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Subscribers',
        },
        beginAtZero: true,
      },
    },
  };

  const stats = [
    {
      title: "Total Subscribers",
      value: !subLoading && !subError ? subs?.data?.total_counts : [],
      href: "/admin/subscription",
      icon: <ImNewTab />
    },
    {
      title: "Total Users",
      value: !userLoading && !userError ? users?.data?.length : [],
      href: "/admin/user",
      icon: <ImNewTab />
    },
    {
      title: "Total Blogs",
      value: !blogLoading && !blogError ? blogs?.data?.total_counts : [],
      href: "/admin/blog",
      icon: <ImNewTab />
    },
    {
      title: "Total Contact Us",
      value: contact && contact?.data,
    },
  ];

  // SORT BLOGS
  if (!blogLoading && !blogError && blogs?.data?.rows) {
    blogs.data.rows = blogs.data.rows.sort((a: blogContent, b: blogContent) => new Date(a.created_at) < new Date(b.created_at) ? 1 : -1);
  }
  // SORT CONTENTS
  if (!contentLoading && !contentError && content?.data?.rows) {
    content.data.rows = content.data.rows.sort((a: contentData, b: contentData) => new Date(a.created_at) < new Date(b.created_at) ? 1 : -1);
  }



  return (
    <div className="space-y-6 pt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p>{stat.title}</p>
                <div className="flex items-center mt-1 text-2xl font-semibold text-gray-900">
                  <h3>{stat.value}</h3>
                  <div className="ml-10 text-primary cursor-pointer hover:opacity-60 peer">
                    {stat.href && <Link href={stat.href}> {stat.icon}</Link>}
                  </div>
                  <p className="hidden peer-hover:block bg-slate-500 p-1 text-white font-medium rounded-sm">Go to this page</p>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          <h3 className="font-medium text-gray-900 px-6 mb-4 text-primary">Recent blogs</h3>
          {!blogLoading && !blogError && <RecentActivites objectType="blog" data={blogs.data.rows.slice(0, 3)} />}

          <h3 className="font-medium text-gray-900 px-6 mt-4 text-primary">Recent Newsletters sent</h3>
          {!contentLoading && !contentError && <RecentActivites objectType="content" data={content.data.rows.slice(0, 3)} />}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Subscriber growth per week
        </h3>
        <div className="h-[500px] bg-gray-100 flex items-center justify-center text-gray-400">
          {!lineLoading && !lineError && <Line data={data} options={options} className="w-full h-full" />}
        </div>
      </div>
    </div>
  );
}


export default withAuth(AdminHome)

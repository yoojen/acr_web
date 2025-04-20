"use client"

import { Dispatch, SetStateAction } from "react";

interface PaginateProps {
    total_page_items: number;
    total_pages: number;
    current_page: number;
    previous_page: number | null;
    next_page: number | null;
    setPageIndex: Dispatch<SetStateAction<number>>
}

const Paginate = ({ total_pages, current_page, setPageIndex }: PaginateProps) => {

    return (
        <div className="flex justify-end my-5">
            {
                total_pages > 1
                && current_page !== 1
                && <button
                    className={`bg-blue-400 text-white font-medium border rounded-sm px-5 py-1 hover:bg-sky-400`}
                    onClick={() => setPageIndex(current_page - 1)}
                >
                    Prev
                </button>

            }

            <button
                className={`bg-blue-700 text-white font-medium border rounded-sm px-5 py-1 hover:bg-sky-500`}>
                {current_page}
            </button>

            {
                total_pages > 1
                && current_page !== total_pages
                && <button
                    className={`bg-blue-400 text-white font-medium border rounded-sm px-5 py-1 hover:bg-sky-400`}
                    onClick={() => setPageIndex(current_page + 1)}
                >
                    Next
                </button>
            }
        </div>
    )
}

export default Paginate
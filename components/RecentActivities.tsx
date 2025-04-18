import { blogContent, contentData } from '@/app/admin/page';
import HtmlParserOptions from '@/utils/htmlParser';
import parse from 'html-react-parser'

function RecentActivites({ objectType, data }: { objectType: string, data: [] }) {
    if (data.length < 1) {
        return <div className="px-6 py-4 flex items-center"> Nothing to show</div >
    }
    return (
        data.map((item: blogContent | contentData, index: number) => (
            <div key={index} className="px-6 py-4 flex items-center">
                <h3 className="mr-5">{index + 1}.</h3>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {objectType === "blog" && 'title' in item && 'author' in item
                            ? `${item.title} - ${item.author}`
                            : 'user' in item && `Creator: ${item.user.first_name} ${item.user.last_name}`}
                    </p>
                    <div className="text-sm text-gray-500 truncate flex">
                        {objectType === "blog"
                            ? 'description' in item ?
                                parse(item.description.substring(0, 50), HtmlParserOptions)
                                : null
                            : 'content' in item
                                ? parse(item.content.substring(0, 50), HtmlParserOptions)
                                : null}
                        <span>...</span>
                    </div>
                </div>
                <div className="ml-4 text-sm text-gray-500">{String(new Date(item.created_at).toLocaleDateString())}</div>
            </div>
        ))
    )
}

export default RecentActivites;
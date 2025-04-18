import {
    RiBold,
    RiItalic,
    RiStrikethrough,
    RiCodeSSlashLine,
    RiListOrdered,
    RiListUnordered
} from "react-icons/ri";
import { Editor } from '@tiptap/react'
import { FaFileArrowUp, FaRegImage } from "react-icons/fa6";
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4 } from "react-icons/lu";
import { PiTextAlignCenter, PiTextAlignJustify, PiTextAlignLeft, PiTextAlignRight } from "react-icons/pi";
import { imageHandler } from "@/utils/upload_utils";


interface TextEditorProps {
    editor: Editor;
    UrlToSendImageTo?: string;
    isBlog?: boolean;
    isSubscription?: boolean;
}


const Button = ({ onClick, isActive, children, }: {
    onClick: () => void; isActive: boolean; disabled: boolean; children: React.ReactNode
}) => {
    return <button
        type="button"
        onClick={onClick}
        // disabled={disabled}
        className={`${isActive ? 'bg-background text-primary rounded-none' : 'bg-white text-black'}`}
    >
        {children}
    </button>
};

const TextEditorMenuBar = ({ editor, isBlog, isSubscription }: TextEditorProps) => {
    if (!editor) {
        return null
    }
    const buttons = [
        {
            icon: <RiBold className="size-5" />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold')
        },
        {
            icon: <RiItalic className="size-5" />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic')
        },
        {
            icon: <RiStrikethrough className="size-5" />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive('strike')
        },
        {
            icon: <RiCodeSSlashLine className="size-5" />,
            onClick: () => editor.chain().focus().toggleCode().run(),
            isActive: editor.isActive('code')
        },
        {
            icon: <RiListOrdered className="size-5" />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('ol')
        },
        {
            icon: <RiListUnordered className="size-5" />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList')
        },
        {
            icon: <LuHeading1 className="size-5" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('h1')
        },
        {
            icon: <LuHeading2 className="size-5" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('h2')
        },
        {
            icon: <LuHeading3 className="size-5" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: editor.isActive('h3')
        },
        {
            icon: <LuHeading4 className="size-5" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
            isActive: editor.isActive('h4')
        },
        {
            icon: <PiTextAlignLeft className="size-5" />,
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            isActive: editor.isActive({ textAlign: 'left' })
        },
        {
            icon: <PiTextAlignRight className="size-5" />,
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            isActive: editor.isActive('right')
        },
        {
            icon: <PiTextAlignCenter className="size-5" />,
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            isActive: editor.isActive({ textAlign: 'center' })
        },
        {
            icon: <PiTextAlignJustify className="size-5" />,
            onClick: () => editor.chain().focus().setTextAlign('justify').run(),
            isActive: editor.isActive({ textAlign: 'justify' })
        },
        {
            icon: <FaRegImage className="size-5" />,
            onClick: () => {
                if (isBlog) {
                    alert("It is blog")
                    imageHandler(editor, "/blogs/create-blog-image")
                }
                if (isSubscription) {
                    alert("It is subscription")
                    imageHandler(editor, "/contents/upload-resource")
                }
            },
            isActive: editor.isActive('img')
        },
        {
            icon: <FaFileArrowUp className="size-5" />,
            onClick: () => {
                const url = prompt("Enter the image URL");
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            },
            isActive: editor.isActive('img')
        }

    ];
    return (
        <div className="grid grid-cols-3 md:grid-cols-10 border">
            {
                buttons.map(({ icon, onClick, isActive }, idx) => {
                    return (
                        <Button
                            key={idx}
                            onClick={onClick}
                            isActive={isActive}
                            disabled
                        >
                            {icon}
                        </Button>
                    )
                })
            }
        </div>
    )
}
export default TextEditorMenuBar
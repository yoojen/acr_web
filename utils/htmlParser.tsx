import Image from "next/image";
import {
    HTMLReactParserOptions,
    Element,
    DOMNode,
    domToReact,
} from "html-react-parser";

const HtmlParserOptions: HTMLReactParserOptions = {
    replace(domNode) {
        if (domNode instanceof Element && domNode.attribs) {
            const { name, children } = domNode;

            if (name === "ul") {
                <ul className="list-disc ml-5" >
                    {domToReact(children as DOMNode[], HtmlParserOptions)}
                </ul>;
            }
            if (name === "ol") {
                <ol className="list-decimal ml-5" >
                    {domToReact(children as DOMNode[], HtmlParserOptions)}
                </ol>;
            }
            if (name === "img") {
                return (
                    <Image
                        src={domNode.attribs.src || ""}
                        alt={domNode.attribs.alt || "Image"}
                        width={
                            domNode.attribs.width ? parseInt(domNode.attribs.width) : 800
                        } // Default width
                        height={
                            domNode.attribs.height ? parseInt(domNode.attribs.height) : 600
                        } // Default height
                        unoptimized={true} // Disable Next.js optimization
                        className="max-w-full h-auto"
                    />
                );
            }

            if (name === "em") {
                return (
                    <em className="italic" >
                        {domToReact(children as DOMNode[], HtmlParserOptions)}
                    </em>
                );
            }
            if (name === "strong") {
                return (
                    <strong className="font-bold" >
                        {domToReact(children as DOMNode[], HtmlParserOptions)}
                    </strong>
                );
            }
            if (["h1", "h2", "h3", "h4"].includes(name)) {
                const headingClasses: {
                    h1: string;
                    h2: string;
                    h3: string;
                    h4: string;
                } = {
                    h1: "text-4xl font-bold",
                    h2: "text-3xl font-semibold",
                    h3: "text-2xl font-medium",
                    h4: "text-xl font-medium",
                };
                return (
                    <div
                        className={headingClasses[name as keyof typeof headingClasses]}
                    >
                        {domToReact(children as DOMNode[], HtmlParserOptions)}
                    </div>
                );
            }
        }
    },
};

export default HtmlParserOptions
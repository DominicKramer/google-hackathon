"use client";

import { useEffect, useState, useRef } from "react";
import { remark } from "remark";
import html from "remark-html";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";
import styles from "./markdown-view.module.css";

import Markdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

export interface MarkdownViewProps {
    markdown: string;
}

export default function MarkdownView({ markdown }: MarkdownViewProps) {
    const [htmlContent, setHtmlContent] = useState<string>("");
 
    useEffect(() => {
        const processMarkdown = async () => {
            const result = await remark()
                .use(html)
                .process(markdown);
            setHtmlContent(result.value.toString());
        };

        processMarkdown();
    }, [markdown]);

    useEffect(() => {
        Prism.highlightAll();
    }, [htmlContent]);

    return (
        <div
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}

export function MarkdownView2({ markdown }: MarkdownViewProps) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            children={markdown}
            components={{
            code(props) {
                const {children, className, node, ...rest} = props
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                    // @ts-ignore
                    <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        style={materialLight}
                    />
                ) : (
                    <code {...rest} className={className}>
                        {children}
                    </code>
                )
            }
            }}
        />
    );
}

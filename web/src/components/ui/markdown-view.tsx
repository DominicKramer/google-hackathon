"use client";

import { useEffect, useState } from "react";
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

export interface MarkdownViewProps {
    markdown: string;
}

export default function MarkdownView({ markdown }: MarkdownViewProps) {
    const [htmlContent, setHtmlContent] = useState<string>("");

    useEffect(() => {
        const processMarkdown = async () => {
            const result = await remark().use(html).process(markdown);
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

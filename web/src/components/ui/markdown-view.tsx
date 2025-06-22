"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
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

    return (
        <div
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}

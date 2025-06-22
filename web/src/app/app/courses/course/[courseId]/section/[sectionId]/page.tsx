"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import MarkdownView from "@/components/ui/markdown-view";
import { SectionOutline } from "@/lib/type_aliases";
import { getSection } from "@/lib/actions";

export default function Section() {
    const params = useParams<{ courseId: string; sectionId: string }>();
    const [section, setSection] = useState<SectionOutline | null>(null);
    useEffect(() => {
        const fetchSection = async () => {
            const sectionData = await getSection(
                params.courseId,
                params.sectionId,
            );
            if (!sectionData) return;

            setSection(sectionData);

            // If any status is not DONE, start polling
            if (
                sectionData.status !== "DONE"
            ) {
                const pollInterval = setInterval(async () => {
                    const updatedSection = await getSection(
                        params.courseId,
                        params.sectionId,
                    );
                    if (!updatedSection) return;

                    setSection(updatedSection);

                    // Stop polling if all statuses are DONE
                    if (
                        updatedSection.status === "DONE"
                    ) {
                        clearInterval(pollInterval);
                    }
                }, 30_000);

                // Cleanup interval on component unmount
                return () => clearInterval(pollInterval);
            }
        };

        fetchSection();
    }, [params.courseId, params.sectionId]);

    if (!section || section.status !== "DONE") {
        return (
            <div className={styles.sectionContainer}>
                <div className={styles.skeleton}>
                    <div className={styles.skeletonProgressBar} />
                    <div className={styles.skeletonTitle} />
                    <hr className={styles.divider} />
                    <div className={styles.skeletonContent}>
                        <div className={styles.skeletonLine} />
                        <div className={styles.skeletonLine} />
                        <div className={styles.skeletonLine} />
                    </div>
                    <div className={styles.navigationButtons}>
                        <div className={styles.skeletonButton} />
                        <div className={styles.skeletonButton} />
                        <div className={styles.skeletonButton} />
                    </div>
                </div>
            </div>
        );
    }

    let markdown = section.contentMd ?? "";
    const references = section.references ?? [];
    
    const referenceMap = new Map();
    for (const ref of references) {
        referenceMap.set(ref.orderIndex + 1, ref);
    }
    
    // Replace [n] and [n, ...] patterns with markdown links
    markdown = markdown.replace(/\[(\d+(?:,\s*\d+)*)\]/g, (match, numbersString) => {
        // Split the numbers and process each one
        const numbers = numbersString.split(/,\s*/).map((num: string) => parseInt(num.trim()));
        let result = '[';
        
        for (let i = 0; i < numbers.length; i++) {
            const key = numbers[i];
            const reference = referenceMap.get(key);
            
            if (reference) {
                // Add the link for this number
                result += `[${key}](${reference.url})`;
            } else {
                // Keep the original number if no reference found
                result += key;
            }
            
            // Add comma separator if not the last number
            if (i < numbers.length - 1) {
                result += ', ';
            }
        }
        
        result += ']';
        return result;
    });

    return (
        <div className={styles.sectionContainer}>
            <h1 className={styles.sectionTitle}>
                {section.title}
            </h1>
            <hr className={styles.divider} />
            <div className={styles.sectionContent}>
                <MarkdownView markdown={markdown} />
            </div>
            
            {section.references && section.references.length > 0 && (
                <div className={styles.referencesSection}>
                    <h3 className={styles.referencesTitle}>References</h3>
                    <div className={styles.referencesList}>
                        {section.references
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((reference) => (
                                <div key={reference.referenceId} className={styles.referenceItem}>
                                    <span className={styles.referenceOrder}>{reference.orderIndex + 1}: </span>
                                    <a 
                                        href={reference.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.referenceLink}
                                    >
                                        {reference.title || reference.url}
                                    </a>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            
            <div className={styles.navigationButtons}>
                {section.previousSectionId && (
                    <Link
                        href={`/app/courses/course/${params.courseId}/section/${section.previousSectionId}`}
                    >
                        <Button flat>← Previous Section</Button>
                    </Link>
                )}
                <Link href={`/app/courses/course/${params.courseId}`}>
                    <Button flat>Overview</Button>
                </Link>
                {section.nextSectionId ? (
                    <Link href={`/app/courses/course/${params.courseId}/section/${section.nextSectionId}`}>
                        <Button flat>Next Section →</Button>
                    </Link>
                ) : (
                    <Link
                        href={`/app/courses/course/${params.courseId}/complete`}
                    >
                        <Button flat>Complete Course →</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

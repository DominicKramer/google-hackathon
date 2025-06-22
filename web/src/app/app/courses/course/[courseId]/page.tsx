"use client";

import styles from "./page.module.css";
import { useEffect, useState, use } from "react";
import { CourseOutline } from "@/lib/type_aliases";
import { getCourseOutline } from "@/lib/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Course({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const courseId = use(params).courseId;
    const [course, setCourse] = useState<CourseOutline | null>(null);

    useEffect(() => {
        const pollCourse = async () => {
            const courseData = await getCourseOutline(courseId);
            setCourse(courseData);

            // Continue polling if either title or description is not done
            if (courseData && courseData.status !== "DONE") {
                setTimeout(pollCourse, 30_000);
            }
        };

        pollCourse();
    }, [courseId]);

    if (course !== null && course.status !== "DONE") {
        return (
            <div className={styles.skeletonContainer}>
                <Card>
                    <CardHeader>
                        <CardTitle>Course creation in progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            The course is being created. This may take several
                            minutes. The course will automatically load when it
                            is ready.
                        </CardDescription>
                    </CardContent>
                </Card>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonDescription} />

                <div className={styles.weeksContainer}>
                    {[1, 2, 3].map((weekIndex) => (
                        <div key={weekIndex} className={styles.skeletonWeek}>
                            <div className={styles.skeletonWeekTitle} />
                            <div className={styles.skeletonWeekDescription} />

                            <div className={styles.sectionsContainer}>
                                {[1, 2, 3].map((sectionIndex) => (
                                    <div
                                        key={sectionIndex}
                                        className={styles.skeletonSection}
                                    >
                                        <div
                                            className={
                                                styles.skeletonSectionContent
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.skeletonSectionTitle
                                                }
                                            />
                                            <div
                                                className={
                                                    styles.skeletonSectionDescription
                                                }
                                            />
                                            <div
                                                className={
                                                    styles.skeletonSectionTime
                                                }
                                            />
                                        </div>
                                        <div
                                            className={styles.skeletonButton}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (course === null) {
        return (
            <div className={styles.skeletonContainer}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonDescription} />
            </div>
        );
    }

    return (
        <div className={styles.courseOutlineContainer}>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDescription}>{course.description}</p>

            <div className={styles.weeksContainer}>
                {course.weeks.map((week) => (
                    <div key={week.weekId} className={styles.weekSection}>
                        <h2 className={styles.weekTitle}>
                            {week.title || `Week ${week.orderIndex + 1}`}
                        </h2>
                        {week.description && (
                            <p className={styles.weekDescription}>
                                {week.description}
                            </p>
                        )}

                        <div className={styles.sectionsContainer}>
                            {week.sections.map((section) => (
                                <div
                                    key={section.sectionId}
                                    className={styles.sectionItem}
                                >
                                    <div className={styles.sectionContent}>
                                        <h3 className={styles.sectionItemTitle}>
                                            {section.title ||
                                                `Day ${section.orderIndex + 1}`}
                                        </h3>
                                        <p
                                            className={
                                                styles.sectionItemDescription
                                            }
                                        >
                                            {section.status === "DONE"
                                                ? section.description
                                                : "Writing section content.  This may take several minutes..."}
                                        </p>
                                        {section.readingTimeMinutes > 0 && (
                                            <span
                                                className={
                                                    styles.sectionItemReadingTime
                                                }
                                            >
                                                {section.readingTimeMinutes} min
                                                read
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/app/courses/course/${courseId}/section/${section.sectionId}`}
                                    >
                                        {section.status === "DONE" ? (
                                            <Button
                                                className={
                                                    styles.navigateButton
                                                }
                                            >
                                                →
                                            </Button>
                                        ) : (
                                            <div
                                                className={
                                                    styles.skeletonButton
                                                }
                                            />
                                        )}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

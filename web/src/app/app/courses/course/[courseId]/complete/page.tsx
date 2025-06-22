"use client";

import { getCourseOutline } from "@/lib/actions";
import { CourseOutline } from "@/lib/type_aliases";
import styles from "./page.module.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/progress-bar";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Complete() {
    const params = useParams();
    const courseId = params.courseId as string;

    useEffect(() => {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 200,
            zIndex: 0,
        };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // since particles fall down, start a bit higher than random
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const [course, setCourse] = useState<CourseOutline | null>(null);
    const [totalSections, setTotalSections] = useState(0);

    useEffect(() => {
        const loadCourse = async () => {
            const courseData = await getCourseOutline(courseId);
            setCourse(courseData);

            let numSections = 0;
            const weeks = courseData?.weeks ?? [];
            for (const week of weeks) {
                numSections += week.sections.length;
            }
            setTotalSections(numSections);
        };
        loadCourse();
    }, [courseId]);

    if (!course) {
        return (
            <div className={styles.completionContainer}>
                <div className={styles.completionContent}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonMessage}></div>

                    <div className={styles.progressSection}>
                        <div className={styles.skeletonSubtitle}></div>
                        <div className={styles.skeletonProgressBar}></div>
                        <div>
                            {[1, 2, 3].map((_, idx) => (
                                <div
                                    key={idx}
                                    className={styles.skeletonSection}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.navigationButtons}>
                        <div className={styles.skeletonButton}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.completionContainer}>
            <div className={styles.completionContent}>
                <h1 className={styles.completionTitle}>Congratulations! 🎉</h1>
                <p className={styles.completionMessage}>
                    You&apos;ve completed the course &quot;{course.title}&quot;.
                    Keep up the great work!
                </p>

                <div className={styles.progressSection}>
                    <h2 className={styles.progressTitle}>
                        You completed all {totalSections} sections
                    </h2>
                    <ProgressBar percentage={100} />
                    <div>
                        {course.weeks.map((week) => (
                            <div key={week.weekId}>
                                <p className={styles.progressText}>
                                    {week.title}{" "}
                                    <span style={{ color: "#22c55e" }}>✓</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.navigationButtons}>
                    <Link href={`/app/courses/course/${params.courseId}`}>
                        <Button flat>← Back to Course</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

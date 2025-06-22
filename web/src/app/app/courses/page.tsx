"use client";

import { getCourses } from "@/lib/actions";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { CourseMetadata } from "@/lib/type_aliases";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Courses() {
    const [courses, setCourses] = useState<CourseMetadata[]>([]);
    const router = useRouter();

    useEffect(() => {
        const pollCourses = async () => {
            const fetchedCourses = await getCourses();
            if (fetchedCourses) {
                setCourses(fetchedCourses);

                // Check if any course is still processing
                const isProcessing = fetchedCourses.some(
                    (course) =>
                        course.status !== "DONE",
                );

                if (isProcessing) {
                    // Schedule next poll in 30 second
                    setTimeout(pollCourses, 30_000);
                }
            }
        };

        // Start polling
        pollCourses();
    }, []);

    const handleCreateCourse = () => {
        router.push("/app/new");
    };

    const handleCourseClick = (courseId: string) => {
        router.push(`/app/courses/course/${courseId}`);
    };

    if (courses.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h2 className={styles.emptyTitle}>No courses yet</h2>
                <p className={styles.emptyDescription}>
                    Create your first course to start learning
                </p>
                <Button onClick={handleCreateCourse} className={styles.createButton}>
                    Create Course
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.courseList}>
            {courses.map((course) => (
                course.status === "DONE" ? (
                    <Card key={course.id}>
                        <CardHeader>
                            <CardTitle>
                                {course.title}
                            </CardTitle>
                            <CardDescription>
                                {course.description}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button onClick={() => handleCourseClick(course.id)}
                                   className={styles.courseButton}>
                                Continue →
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card key={course.id}>
                        <CardHeader>
                            <CardTitle>
                                Course creation in progress
                            </CardTitle>
                            <CardDescription>
                                The course is being created.  This may take
                                several minutes.  The course will automatically
                                load when it is ready.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <span></span>
                        </CardFooter>
                    </Card>
                )
            ))}
        </div>
    );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progressbar";
import { getTaskStatus } from "@/lib/actions";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const POLL_INTERVAL = 1000;
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes total polling time

interface StatusRow {
    task_id: string;
    user_id: string;
    status: "PENDING" | "STARTED" | "PROGRESS" | "SUCCEEDED" | "FAILED";
    progress: number;
    message: string;
    course_id: string;
    created_at: string;
    updated_at: string;
}

export default function StatusPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [row, setRow] = useState<StatusRow | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        if (!taskId || !isPolling) {
            return;
        }

        const startTime = Date.now();
        let pollTimeout: NodeJS.Timeout;

        const poll = async () => {
            try {
                const data = await getTaskStatus(taskId);
                setRow(data);

                const course_id = data?.course_id;
                if (course_id) {
                    setIsPolling(false);
                    router.push(`/app/courses/course/${course_id}`);
                    return;
                }

                // Check if we've exceeded the maximum polling time
                if (Date.now() - startTime >= MAX_POLL_TIME) {
                    setIsPolling(false);
                    return;
                }

                // Schedule next poll
                pollTimeout = setTimeout(poll, POLL_INTERVAL);
            } catch (err) {
                console.error("Polling error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "An error occurred while polling",
                );
                setIsPolling(false);
            }
        };

        poll();

        return () => {
            if (pollTimeout) {
                clearTimeout(pollTimeout);
            }
        };
    }, [taskId, isPolling, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Creating your course</CardTitle>
            </CardHeader>
            <CardContent>
                <ProgressBar value={row?.progress ?? 0} />
                <div className={styles.container}>
                    {error && (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Error: {error}</p>
                        </div>
                    )}
                    {row?.message && (
                        <div className={styles.messageContainer}>
                            <p className={styles.messageText}>{row.message}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

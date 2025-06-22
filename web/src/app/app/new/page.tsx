"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/lib/actions";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewCourse() {
    const router = useRouter();
    const [description, setDescription] = useState("");
    const [expectedResult, setExpectedResult] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Some Experience");
    const [minPerDay, setMinPerDay] = useState("");
    const [weeks, setWeeks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const { course_id } = await createCourse({
            description,
            expectedResult,
            experienceLevel,
            minPerDay: parseInt(minPerDay),
            weeks: parseInt(weeks),
        });
        router.push(`/app/courses/course/${course_id}`);
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2 className={styles.heading}>What would you like to learn?</h2>
            <textarea
                className={styles.textarea}
                placeholder="Course description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <h2 className={styles.heading}>
                Tell us what is the expected result of your learning
            </h2>
            <div className={styles.resultBtns}>
                {[
                    "Become Conversational",
                    "Become Practitioner",
                    "Become Expert",
                ].map((r) => (
                    <button
                        type="button"
                        key={r}
                        className={
                            expectedResult === r
                                ? styles.selectedResultBtn
                                : styles.resultBtn
                        }
                        onClick={() => setExpectedResult(r)}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <h2 className={styles.heading}>
                What&apos;s your current level of understanding?
            </h2>
            <div className={styles.sliderRow}>
                <Input
                    style={{ marginLeft: "36px", marginRight: "36px" }}
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={[
                        "New to the topic",
                        "Some Experience",
                        "Very Experienced",
                    ].indexOf(experienceLevel)}
                    onChange={(e) =>
                        setExperienceLevel(
                            [
                                "New to the topic",
                                "Some Experience",
                                "Very Experienced",
                            ][Number(e.target.value)],
                        )
                    }
                />
            </div>
            <div className={styles.sliderLabels}>
                <span className={styles.sliderLabel}>New to the topic</span>
                <span className={styles.sliderLabel}>Some Experience</span>
                <span className={styles.sliderLabel}>Very Experienced</span>
            </div>
            <h2 className={styles.heading}>
                How much time would you like to spend on learning?
            </h2>
            <div className={styles.timeRow}>
                <Input
                    className={styles.input}
                    type="number"
                    min={1}
                    placeholder="Min per Day"
                    value={minPerDay}
                    onChange={(e) => setMinPerDay(e.target.value)}
                    required
                />

                <Input
                    className={styles.input}
                    type="number"
                    min={1}
                    placeholder="Weeks"
                    value={weeks}
                    onChange={(e) => setWeeks(e.target.value)}
                    required
                />
            </div>
            <Button
                style={{ width: "100%" }}
                type="submit"
                disabled={submitting}
            >
                {submitting ? "Creating..." : "Create Course"}
            </Button>
        </form>
    );
}

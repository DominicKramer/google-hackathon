"use server";

import { createClient } from "@/lib/supabase/server";
import { CourseMetadata, CourseOutline, SectionOutline } from "./type_aliases";

export async function getCourses(): Promise<CourseMetadata[] | null> {
    console.log("calling getCourses");

    const supabase = await createClient();
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from("courses")
        .select("id, title, status, description")
        .eq("owner_id", user.id) // redundant but explicit
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function getCourseOutline(
    courseId: string,
): Promise<CourseOutline | null> {
    console.log("calling getCourseOutline for courseId=", courseId);

    const supabase = await createClient();

    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from("courses")
        .select(
            `
                id, title, status, description, user_description, user_expected_result, 
                user_experience_level, user_min_per_day, user_num_weeks, created_at,
                weeks (
                    id, title, status, description, learning_objectives, order_index, created_at,
                    sections (
                    id, title, status, description, content_md, reading_time_min,
                    previous_section_id, next_section_id, order_index, created_at,
                        references (
                            id, url, title, order_index, created_at
                        )
                    )
                )
            `,
        )
        .eq("id", courseId)
        .single(); // ← throw if >1 rows, return null‑ish if 0

    if (error || !data) {
        return null;
    }

    /* Shape the payload to the TypeScript interface */
    const outline: CourseOutline = {
        courseId: data.id,
        title: data.title,
        status: data.status,
        description: data.description,
        userDescription: data.user_description,
        userExpectedResult: data.user_expected_result,
        userExperienceLevel: data.user_experience_level,
        userMinPerDay: data.user_min_per_day,
        userNumWeeks: data.user_num_weeks,
        createdAt: data.created_at,
        weeks: data.weeks
            .sort((a, b) => a.order_index - b.order_index)
            .map((week) => ({
                weekId: week.id,
                title: week.title,
                status: week.status,
                description: week.description,
                learningObjectives: week.learning_objectives,
                orderIndex: week.order_index,
                createdAt: week.created_at,
                sections: week.sections
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((section) => ({
                        sectionId: section.id,
                        title: section.title,
                        status: section.status,
                        description: section.description,
                        contentMd: section.content_md,
                        readingTimeMinutes: section.reading_time_min,
                        previousSectionId: section.previous_section_id,
                        nextSectionId: section.next_section_id,
                        orderIndex: section.order_index,
                        createdAt: section.created_at,
                        references: section.references
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((reference) => ({
                                referenceId: reference.id,
                                url: reference.url,
                                title: reference.title,
                                orderIndex: reference.order_index,
                                createdAt: reference.created_at,
                            })),
                    })),
            })),
    };

    return outline;
}

export async function getSection(
    courseId: string,
    sectionId: string,
): Promise<SectionOutline | null> {
    console.log(
        "calling getSection for courseId=",
        courseId,
        "and sectionId=",
        sectionId,
    );

    const supabase = await createClient();

    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
        return null;
    }

    /* Fetch the section row (RLS further restricts scope) */
    const { data: section, error: secErr } = await supabase
        .from("sections")
        .select(
            `
                id, title, status, description, content_md, reading_time_min,
                previous_section_id, next_section_id, order_index, created_at,
                references (
                    id, url, title, order_index, created_at
                )
            `,
        )
        .eq("id", sectionId)
        .eq("course_id", courseId)
        .single(); // ⇢ returns object, 404 if none
    if (secErr || !section) {
        return null;
    }

    const result: SectionOutline = {
        sectionId: section.id,
        title: section.title,
        status: section.status,
        description: section.description,
        contentMd: section.content_md,
        readingTimeMinutes: section.reading_time_min,
        previousSectionId: section.previous_section_id,
        nextSectionId: section.next_section_id,
        orderIndex: section.order_index,
        createdAt: section.created_at,
        references: section.references
            .sort((a, b) => a.order_index - b.order_index)
            .map((reference) => ({
                referenceId: reference.id,
                url: reference.url,
                title: reference.title,
                orderIndex: reference.order_index,
                createdAt: reference.created_at,
            })),
    };

    return result;
}

export async function createCourse({
    description,
    expectedResult,
    experienceLevel,
    minPerDay,
    weeks,
}: {
    description: string;
    expectedResult: string;
    experienceLevel: string;
    minPerDay: number;
    weeks: number;
}): Promise<{ course_id: string }> {
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    const response = await fetch(`http://localhost:8000/api/v1/create-course`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            description,
            expectedResult,
            experienceLevel,
            minPerDay,
            weeks,
        }),
    });
    return await response.json();
}

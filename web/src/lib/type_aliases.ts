import { Database } from "./types";

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Week = Database["public"]["Tables"]["weeks"]["Row"];
export type Reference = Database["public"]["Tables"]["references"]["Row"];
export type Status = Database["public"]["Enums"]["status"];

export type CourseMetadata = Pick<Course, "id" | "title" | "status" | "description">;

export interface CourseOutline {
  courseId: string;
  title: string | null;
  status: Status;
  description: string | null;
  userDescription: string | null;
  userExpectedResult: string | null;
  userExperienceLevel: string | null;
  userMinPerDay: number;
  userNumWeeks: number;
  createdAt: string;
  weeks: WeekOutline[];
}

export interface WeekOutline {
  weekId: string;
  title: string | null;
  status: Status;
  description: string | null;
  learningObjectives: string[];
  orderIndex: number;
  createdAt: string;
  sections: SectionOutline[];
}

export interface SectionOutline {
  sectionId: string;
  title: string | null;
  status: Status;
  description: string | null;
  contentMd: string | null;
  readingTimeMinutes: number;
  previousSectionId: string | null;
  nextSectionId: string | null;
  orderIndex: number;
  createdAt: string;
  references: ReferenceOutline[];
}

export interface ReferenceOutline {
  referenceId: string;
  url: string;
  title: string | null;
  orderIndex: number;
  createdAt: string;
}

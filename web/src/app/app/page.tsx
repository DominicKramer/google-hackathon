import { redirect } from "next/navigation";

export default async function CoursesRootPage() {
    redirect("/app/courses");
}

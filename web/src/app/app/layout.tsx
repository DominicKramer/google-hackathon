import { AuthButton } from "@/components/auth-button";
import { redirect } from "next/navigation";

import styles from "./layout.module.css";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/topbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/auth/login");
    }

    return (
        <div>
            <TopBar>
                <span className={styles.topbarLeft}>
                    <Link href="/app/new">
                        <Button>New course</Button>
                    </Link>
                    <Link href="/app/courses">
                        <Button
                            flat
                            style={{
                                marginTop: "12px",
                            }}
                        >
                            My Courses
                        </Button>
                    </Link>
                </span>
                <AuthButton />
            </TopBar>
            <div className={styles.contentContainer}>{children}</div>
        </div>
    );
}

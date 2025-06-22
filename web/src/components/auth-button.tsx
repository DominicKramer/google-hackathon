import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Button } from "./ui/button";
import styles from "./auth-button.module.css";

export async function AuthButton() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user ? (
        <div>
            <LogoutButton />
        </div>
    ) : (
        <div className={styles.loginLogoutContainer}>
            <Button>
                <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button>
                <Link href="/auth/sign-up">Sign up</Link>
            </Button>
        </div>
    );
}

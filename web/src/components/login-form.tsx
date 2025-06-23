"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // Update this route to redirect to an authenticated route. The user already has an active session.
            router.push("/app");
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : "An error occurred",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                            {error && <p>{error}</p>}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                style={{ width: "100%", marginTop: "12px" }}
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                        <div>
                            Don&apos;t have an account?{" "}
                            <span style={{ float: "right" }}>
                                <Link href="/auth/sign-up">
                                    <Button flat>Sign up</Button>
                                </Link>
                            </span>
                        </div>
                        <div style={{ marginTop: "-8px" }}>
                            Forgot your password?{" "}
                            <span style={{ float: "right" }}>
                                <Link href="/auth/forgot-password">
                                    <Button flat>Reset it</Button>
                                </Link>
                            </span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

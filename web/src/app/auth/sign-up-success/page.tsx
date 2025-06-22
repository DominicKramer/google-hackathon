import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Page() {
    return (
        <div>
            <div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Thank you for signing up!</CardTitle>
                            <CardDescription>
                                Check your email to confirm
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>
                                You&apos;ve successfully signed up. Please check
                                your email to confirm your account before
                                signing in.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

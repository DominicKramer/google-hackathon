import styles from "./page.module.css";

export default function RootPage() {
    return (
        <div className={styles.container}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <a href="/" className={styles.logo}>
                    LearnAI
                </a>
                <div className={styles.authButtons}>
                    <a href="/auth/login" className={styles.loginButton}>
                        Log in
                    </a>
                    <a href="/auth/sign-up" className={styles.signupButton}>
                        Sign up
                    </a>
                </div>
            </div>

            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>
                        <span>Your Personal</span>
                        <span className={styles.titleHighlight}>
                            AI Learning Journey
                        </span>
                    </h1>
                    <p className={styles.subtitle}>
                        Transform your learning experience with AI-powered
                        personalized courses. Tell us what you want to learn,
                        and we'll create a custom curriculum just for you.
                    </p>
                    <div className={styles.buttonContainer}>
                        <a href="#" className={styles.primaryButton}>
                            Get Started
                        </a>
                        <a href="#" className={styles.secondaryButton}>
                            Learn More
                        </a>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className={styles.features}>
                <div className={styles.featuresContainer}>
                    <div className={styles.featuresHeader}>
                        <h2 className={styles.featuresSubtitle}>Features</h2>
                        <p className={styles.featuresTitle}>
                            A Better Way to Learn
                        </p>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>
                                    Personalized Learning Path
                                </h3>
                                <p className={styles.featureDescription}>
                                    Get a custom curriculum tailored to your
                                    goals, learning style, and pace.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>
                                    AI-Powered Progress
                                </h3>
                                <p className={styles.featureDescription}>
                                    Our AI adapts to your progress and adjusts
                                    the content to ensure optimal learning.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                    />
                                </svg>
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>
                                    Interactive Learning
                                </h3>
                                <p className={styles.featureDescription}>
                                    Engage with interactive exercises, quizzes,
                                    and real-world projects.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>
                                    Expert Support
                                </h3>
                                <p className={styles.featureDescription}>
                                    Get help from AI tutors and connect with a
                                    community of learners.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className={styles.cta}>
                <div className={styles.ctaContainer}>
                    <h2 className={styles.ctaTitle}>
                        <span>Ready to start your learning journey?</span>
                        <span className={styles.titleHighlight}>
                            Start your free trial today.
                        </span>
                    </h2>
                    <a href="#" className={styles.ctaButton}>
                        Get started
                    </a>
                </div>
            </div>
        </div>
    );
}

import styles from "./progress-bar.module.css";

interface ProgressBarProps {
    percentage: number;
    showText?: boolean;
}

export default function ProgressBar({
    percentage,
    showText = true,
}: ProgressBarProps) {
    return (
        <div className={styles.progressBarContainer}>
            <div
                className={styles.progressBar}
                style={{ width: `${percentage}%` }}
            />
            {showText && (
                <div className={styles.progressText}>
                    {Math.round(percentage)}% Complete
                </div>
            )}
        </div>
    );
}

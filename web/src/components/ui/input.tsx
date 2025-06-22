import styles from "./input.module.css";

export function Input(props: React.ComponentProps<"input">) {
    return <input className={styles.input} {...props} />;
}

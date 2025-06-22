import * as React from "react";
import styles from "./label.module.css";

export function Label(props: React.ComponentProps<"label">) {
    return <label className={styles.label} {...props} />;
}

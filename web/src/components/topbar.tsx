import { CSSProperties } from "react";
import styles from "./topbar.module.css";

interface TopBarProps {
    children: React.ReactNode;
    style?: CSSProperties;
}

export default function TopBar({ children, style }: TopBarProps) {
    return (
        <div className={styles.topbar} style={style}>
            {children}
        </div>
    );
}

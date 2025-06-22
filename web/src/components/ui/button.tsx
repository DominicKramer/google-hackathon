import styles from "./button.module.css";
import clsx from "clsx";

export interface ButtonProps extends React.ComponentProps<"button"> {
    flat?: boolean;
    loading?: boolean;
}

export function Button(props: ButtonProps) {
    return (
        <button
            className={clsx(undefined, {
                [styles.button]: !props.flat,
                [styles.flat]: props.flat,
                [styles.loading]: props.loading,
            })}
            disabled={props.loading}
            {...{ ...props, flat: undefined, loading: undefined }}
        >
            {props.loading ? "..." : props.children}
        </button>
    );
}

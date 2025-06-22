import styles from "./button.module.css";
import clsx from "clsx";

export interface ButtonProps extends React.ComponentProps<"button"> {
    flat?: boolean;
}

export function Button(props: ButtonProps) {
    return (
        <button
            className={clsx(undefined, {
                [styles.button]: !props.flat,
                [styles.flat]: props.flat,
            })}
            {...{ ...props, flat: undefined }}
        >
            {props.children}
        </button>
    );
}

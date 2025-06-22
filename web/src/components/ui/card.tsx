import * as React from "react";
import styles from "./card.module.css";

export interface CardTitleProps {
    children: React.ReactNode;
}

export function CardTitle({ children }: CardTitleProps) {
    return <div className={styles.cardTitle}>{children}</div>;
}

export interface CardDescriptionProps {
    children: React.ReactNode;
}

export function CardDescription({ children }: CardDescriptionProps) {
    return <div className={styles.cardDescription}>{children}</div>;
}

export interface CardHeaderProps {
    children:
        | [
              React.ReactElement<typeof CardTitle>,
              React.ReactElement<typeof CardDescription>,
          ]
        | React.ReactElement<typeof CardTitle>;
}

export function CardHeader({ children }: CardHeaderProps) {
    return <div className={styles.cardHeader}>{children}</div>;
}

export interface CardFooterProps {
    children: React.ReactNode;
}

export function CardFooter({ children }: CardFooterProps) {
    return <div className={styles.cardFooter}>{children}</div>;
}

export interface CardContentProps {
    children: React.ReactNode;
}

export function CardContent({ children }: CardContentProps) {
    return <div className={styles.cardContent}>{children}</div>;
}

export interface CardProps {
    children:
        | [
              React.ReactElement<typeof CardHeader>,
              React.ReactElement<typeof CardContent>,
              React.ReactElement<typeof CardFooter>?,
          ]
        | [
              React.ReactElement<typeof CardContent>,
              React.ReactElement<typeof CardFooter>?,
          ];
}

export function Card({ children }: CardProps) {
    return <div className={styles.card}>{children}</div>;
}

"use client";

import { useState } from "react";
import "./button.css";
import styles from "./counter.module.css";

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  return (
    <div className={styles.counter}>
      <span className={styles.count}>{count}</span>
      <button className="button" onClick={() => setCount((c) => c + 1)} type="button">
        Increment
      </button>
    </div>
  );
}

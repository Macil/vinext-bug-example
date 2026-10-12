import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Counter } from "./counter";
import styles from "./counter.module.css";

test("starts at the initial count", () => {
  render(<Counter initial={3} />);

  expect(screen.getByText("3")).toHaveClass(styles.count);
});

test("increments when the button is clicked", async () => {
  const user = userEvent.setup();
  render(<Counter initial={3} />);

  await user.click(screen.getByRole("button", { name: "Increment" }));

  expect(screen.getByText("4")).toBeInTheDocument();
});

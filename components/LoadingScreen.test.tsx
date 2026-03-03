import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen Component (White Box)", () => {
  it("renders the component properly", () => {
    render(<LoadingScreen />);

    // Check for the main text "PLN SMART" -> The word "PLN" and "SMART" are split in DOM
    const plnText = screen.getByText(/PLN/i);
    const smartText = screen.getByText(/SMART/i);

    expect(plnText).toBeInTheDocument();
    expect(smartText).toBeInTheDocument();

    // Check for the loading text
    const loadingMessage = screen.getByText("Memuat Sistem...");
    expect(loadingMessage).toBeInTheDocument();
  });

  it("contains the loading indicator dots", () => {
    const { container } = render(<LoadingScreen />);

    // There should be 3 animated dots
    const dots = container.querySelectorAll(
      ".w-2.h-2.bg-blue-500.rounded-full",
    );
    expect(dots.length).toBe(3);
  });
});

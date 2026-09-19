import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen Component (White Box)", () => {
  it("renders the component properly", () => {
    render(<LoadingScreen />);

    // Check for the main text "SMARTTRAFO" -> The word "SMART" and "TRAFO" are split in DOM
    const smartText = screen.getByText(/SMART/i);
    const trafoText = screen.getByText(/TRAFO/i);

    expect(smartText).toBeInTheDocument();
    expect(trafoText).toBeInTheDocument();

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

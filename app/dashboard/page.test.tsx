import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "./page";

// The page dynamically imports DashboardContent.
// We need to mock next/dynamic to return a mock component so we can verify the page wraps it.
jest.mock("next/dynamic", () => () => {
  const MockComponent = () => (
    <div data-testid="dashboard-content-mock">Mocked Dashboard Content</div>
  );
  return MockComponent;
});

describe("DashboardPage (White Box Testing)", () => {
  it("renders DashboardContent correctly", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("dashboard-content-mock")).toBeInTheDocument();
  });
});

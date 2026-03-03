import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "./page";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe("LoginPage (White Box Testing)", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders login form properly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Selamat Datang Kembali")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("handles successful login flow", async () => {
    // Mock successful supabase auth
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 1 } },
      error: null,
    });

    render(<LoginPage />);

    // Type credentials
    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "admin@pln.co.id" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "password123" },
    });

    // Click login
    fireEvent.click(screen.getByTestId("login-button"));

    // Loading state is triggered in UI but it's hard to test loader sequentially without act issues,
    // let's just make sure supabase was called with correct args
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "admin@pln.co.id",
      password: "password123",
    });

    // Wait for router push to be called after async success
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 2000 },
    ); // Login has a 1 second artificial timeout
  });

  it("handles failed login flow", async () => {
    // Mock failed supabase auth
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error("Invalid login credentials"),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "wrong@pln.co.id" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for the login button to be re-enabled (loading state is false) after error handling
    await waitFor(() => {
      expect(screen.getByTestId("login-button")).not.toBeDisabled();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});

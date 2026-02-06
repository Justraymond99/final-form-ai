import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QuickActions } from "./QuickActions";

// Mock CreateCustomGoalDialog to avoid deep dependency tree
vi.mock("@/components/CreateCustomGoalDialog", () => ({
  CreateCustomGoalDialog: () => <div data-testid="goal-dialog" />,
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("QuickActions", () => {
  it("renders all four action buttons", () => {
    renderWithRouter(<QuickActions />);
    expect(screen.getByText("Start Workout")).toBeInTheDocument();
    expect(screen.getByText("Log Food")).toBeInTheDocument();
    expect(screen.getByText("Set Goal")).toBeInTheDocument();
    expect(screen.getByText("View Progress")).toBeInTheDocument();
  });

  it("renders the custom goal dialog", () => {
    renderWithRouter(<QuickActions />);
    expect(screen.getByTestId("goal-dialog")).toBeInTheDocument();
  });
});

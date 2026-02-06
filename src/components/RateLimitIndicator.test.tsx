import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RateLimitIndicator, RateLimitBadge } from "./RateLimitIndicator";

describe("RateLimitIndicator", () => {
  it("shows nothing when remaining is above threshold and showAlways is false", () => {
    const { container } = render(
      <RateLimitIndicator remaining={15} maxRequests={30} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows warning when remaining is low", () => {
    render(<RateLimitIndicator remaining={3} maxRequests={30} />);
    expect(screen.getByText("AI Requests")).toBeInTheDocument();
    expect(screen.getByText("3/30")).toBeInTheDocument();
  });

  it("shows exhausted alert when remaining is 0", () => {
    render(<RateLimitIndicator remaining={0} maxRequests={30} />);
    expect(screen.getByText("Rate Limit Reached")).toBeInTheDocument();
  });
});

describe("RateLimitBadge", () => {
  it("shows nothing when remaining is above threshold", () => {
    const { container } = render(
      <RateLimitBadge remaining={10} maxRequests={30} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows badge when remaining is low", () => {
    render(<RateLimitBadge remaining={3} maxRequests={30} />);
    expect(screen.getByText("3 left")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KnowledgeView, PamAcademy, PVWA_NAV_ITEMS } from "@/components/pam-academy";

describe("KnowledgeView (Knowledge Hub)", () => {
  it("renders both PAM Reference and Academy Learning Path areas with all 5 pillars and 6 classes", () => {
    render(<KnowledgeView setActive={vi.fn()} setSelectedClass={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /pam knowledge base/i })).toBeInTheDocument();
    expect(screen.getByText("PAM REFERENCE")).toBeInTheDocument();
    expect(screen.getByText("ACADEMY LEARNING PATH")).toBeInTheDocument();

    expect(screen.getByText("DIGITAL VAULT")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Hardened, encrypted central repository enforcing Safe boundary access control lists and immutable audit storage.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("PVWA GATEWAY")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Unified web interface providing operator workflows, request authorizations, and inventory visibility.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("CPM ENGINE")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Central Policy Manager executing automated verify, change, and reconcile operations across enterprise targets.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("PSM BROKER")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Privileged Session Manager injecting credentials dynamically into recorded, monitored, and isolable RDP/SSH sessions.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("TARGET ENDPOINTS")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Enterprise Windows servers, Linux hosts, SQL Server instances, and Oracle databases under PAM governance.",
      ),
    ).toBeInTheDocument();

    for (const label of ["CLASS 01", "CLASS 02", "CLASS 03", "CLASS 04", "CLASS 05", "CLASS 06"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: /start/i })).toHaveLength(6);
  });

  it("filters reference pillars and Academy classes case-insensitively across supported search terms", () => {
    render(<KnowledgeView setActive={vi.fn()} setSelectedClass={vi.fn()} />);
    const searchInput = screen.getByRole("searchbox", {
      name: /search pam reference and academy classes/i,
    });

    const termExpectations: { query: string; expectedText: string }[] = [
      { query: "Vault", expectedText: "DIGITAL VAULT" },
      { query: "digital vault", expectedText: "DIGITAL VAULT" },
      { query: "PVWA", expectedText: "PVWA GATEWAY" },
      { query: "web access", expectedText: "PVWA GATEWAY" },
      { query: "CPM", expectedText: "CPM ENGINE" },
      { query: "Password Rotation", expectedText: "CPM ENGINE" },
      { query: "PSM", expectedText: "PSM BROKER" },
      { query: "session management", expectedText: "PSM BROKER" },
      { query: "Target Endpoints", expectedText: "TARGET ENDPOINTS" },
      { query: "windows", expectedText: "TARGET ENDPOINTS" },
      { query: "Linux", expectedText: "TARGET ENDPOINTS" },
      { query: "SQL Server", expectedText: "TARGET ENDPOINTS" },
      { query: "oracle", expectedText: "TARGET ENDPOINTS" },
      { query: "Safe administration", expectedText: "CLASS 02" },
      { query: "least privilege", expectedText: "CLASS 02" },
    ];

    for (const { query, expectedText } of termExpectations) {
      fireEvent.change(searchInput, { target: { value: query } });
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    }

    fireEvent.change(searchInput, { target: { value: "onboarding" } });
    expect(screen.getByText("CLASS 03")).toBeInTheDocument();
    expect(screen.queryByText("DIGITAL VAULT")).not.toBeInTheDocument();
    expect(screen.getByText(/no architecture pillars match/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Oracle" } });
    expect(screen.getByText("TARGET ENDPOINTS")).toBeInTheDocument();
    expect(screen.queryByText("CLASS 01")).not.toBeInTheDocument();
    expect(screen.getByText(/no academy classes match/i)).toBeInTheDocument();
  });

  it("displays an empty state when nothing matches and restores all items when cleared", () => {
    render(<KnowledgeView setActive={vi.fn()} setSelectedClass={vi.fn()} />);
    const searchInput = screen.getByRole("searchbox", {
      name: /search pam reference and academy classes/i,
    });

    fireEvent.change(searchInput, { target: { value: "nonexistent-pam-term" } });
    expect(screen.getByText(/no matching knowledge hub entries/i)).toBeInTheDocument();

    const clearButtons = screen.getAllByRole("button", { name: /clear search/i });
    expect(clearButtons.length).toBeGreaterThan(0);
    fireEvent.click(clearButtons[0]!);

    expect(searchInput).toHaveValue("");
    expect(screen.getByText("DIGITAL VAULT")).toBeInTheDocument();
    expect(screen.getByText("TARGET ENDPOINTS")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /start/i })).toHaveLength(6);
  });

  it("navigates to Academy with the preserved class ID when clicking a class Start button", () => {
    const setActive = vi.fn();
    const setSelectedClass = vi.fn();

    render(<KnowledgeView setActive={setActive} setSelectedClass={setSelectedClass} />);

    const startButtons = screen.getAllByRole("button", { name: /start/i });
    fireEvent.click(startButtons[4]!);

    expect(setSelectedClass).toHaveBeenCalledWith("class-05");
    expect(setActive).toHaveBeenCalledWith("academy");
  });
});

describe("Knowledge Hub primary navigation accessibility", () => {
  it("registers a single Knowledge Hub entry in PVWA_NAV_ITEMS while preserving all existing entries", () => {
    const knowledgeEntries = PVWA_NAV_ITEMS.filter((item) => item.id === "knowledge");
    expect(knowledgeEntries).toHaveLength(1);
    expect(knowledgeEntries[0]?.label).toBe("Knowledge Hub");

    const ids = PVWA_NAV_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(PVWA_NAV_ITEMS.length);
    expect(ids).toEqual([
      "overview",
      "accounts",
      "safes",
      "cpm",
      "psm",
      "policies",
      "access",
      "audit",
      "discovery",
      "academy",
      "troubleshooting",
      "knowledge",
    ]);
  });

  it("navigates to Knowledge Hub from primary navigation, sets active state, and preserves switching to existing sections", () => {
    window.history.replaceState({}, "", "/");
    render(<PamAcademy />);

    const nav = screen.getByRole("navigation", { name: /pvwa primary navigation/i });
    const knowledgeTab = within(nav).getByRole("button", { name: /knowledge hub/i });
    const accountsTab = within(nav).getByRole("button", { name: /^accounts$/i });
    const dashboardTab = within(nav).getByRole("button", { name: /^dashboard$/i });

    expect(accountsTab).toHaveClass("active");
    expect(knowledgeTab).not.toHaveClass("active");

    fireEvent.click(knowledgeTab);

    expect(knowledgeTab).toHaveClass("active");
    expect(knowledgeTab).toHaveAttribute("aria-current", "page");
    expect(accountsTab).not.toHaveClass("active");
    expect(screen.getByRole("heading", { name: /pam knowledge base/i })).toBeInTheDocument();
    expect(screen.getByText("DIGITAL VAULT")).toBeInTheDocument();

    fireEvent.click(dashboardTab);

    expect(dashboardTab).toHaveClass("active");
    expect(dashboardTab).toHaveAttribute("aria-current", "page");
    expect(knowledgeTab).not.toHaveClass("active");
    expect(knowledgeTab).not.toHaveAttribute("aria-current");
  });

  it("activates the Knowledge Hub tab when PamAcademy opens directly to initialSection='knowledge'", () => {
    window.history.replaceState({}, "", "/?section=knowledge");
    render(<PamAcademy initialSection="knowledge" />);

    const nav = screen.getByRole("navigation", { name: /pvwa primary navigation/i });
    const knowledgeTab = within(nav).getByRole("button", { name: /knowledge hub/i });

    expect(knowledgeTab).toHaveClass("active");
    expect(knowledgeTab).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: /pam knowledge base/i })).toBeInTheDocument();
  });
});

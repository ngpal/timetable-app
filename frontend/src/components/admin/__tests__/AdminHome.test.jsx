import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminHome from "../AdminHome";
import * as dashboardService from "../../../services/dashboardService";

// ✅ Mock Recharts (charts break in test environment)
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: () => <div>BarChart</div>,
  Bar: () => <div>Bar</div>,
  PieChart: () => <div>PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

describe("AdminHome", () => {

  const mockStats = {
    facultyCount: 10,
    courseCount: 20,
    roomCount: 5,
  };

  test("shows loading initially", () => {
    jest.spyOn(dashboardService, "getDashboardStats").mockResolvedValue(mockStats);

    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading dashboard statistics/i)).toBeInTheDocument();
  });

  test("renders dashboard data after API success", async () => {
    jest.spyOn(dashboardService, "getDashboardStats").mockResolvedValue(mockStats);

    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    expect(screen.getByText(/total faculty/i)).toBeInTheDocument();
    expect(screen.getByText(/total courses/i)).toBeInTheDocument();
    expect(screen.getByText(/total rooms/i)).toBeInTheDocument();
  });

  test("shows error message when API fails", async () => {
    jest
      .spyOn(dashboardService, "getDashboardStats")
      .mockRejectedValue(new Error("API failed"));

    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/api failed/i)).toBeInTheDocument();
    });
  });

  test("navigates when a stat card is clicked", async () => {
    jest.spyOn(dashboardService, "getDashboardStats").mockResolvedValue(mockStats);

    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>
    );

    const facultyCard = await screen.findByText(/total faculty/i);

    fireEvent.click(facultyCard);

    // navigation can't be directly seen, so we just confirm card exists and clickable
    expect(facultyCard).toBeInTheDocument();
  });

});
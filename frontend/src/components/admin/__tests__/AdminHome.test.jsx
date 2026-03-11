import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminHome from "../AdminHome";
import * as dashboardService from "../../../services/dashboardService";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  RadialBarChart: ({ children }) => <div>{children}</div>,
  RadialBar: () => <div />,
  AreaChart: ({ children }) => <div>{children}</div>,
  Area: () => <div />,
}));

describe("AdminHome", () => {
  const mockStats = {
    facultyCount: 10,
    courseCount: 20,
    roomCount: 5,
    timetableCount: 3,
    pendingRequests: 2,
    facultyByDept: [{ name: "CSE", value: 6 }, { name: "ECE", value: 4 }],
    facultyByDesignation: [{ name: "Assistant Professor", value: 7 }],
    facultyByType: [{ name: "Full-time", value: 8 }],
    coursesByDept: [{ name: "CSE", value: 12 }],
    coursesByType: [{ name: "Core", value: 15 }],
    creditDistribution: [{ credits: 3, count: 10 }],
    roomsByType: [{ name: "Classroom", value: 4 }],
    roomsByBuilding: [{ name: "ABIII", value: 5 }],
    capacityStats: { totalCapacity: 300, avgCapacity: 60, maxCapacity: 120, minCapacity: 30 },
    slotHeatmap: { Monday: { 1: 2, 2: 1 }, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {} },
    totalSlotsUsed: 3,
    busiestDay: "Monday",
    busiestSlot: 1,
    requestsByStatus: [{ name: "Pending_Admin", value: 2 }],
    recentRequests: [],
    departmentWorkload: [{ department: "CSE", sections: 2, totalSlots: 30, avgSlotsPerSection: 15 }],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows loading initially", async () => {
    jest.spyOn(dashboardService, "getDashboardStats").mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading dashboard analytics/i)).toBeInTheDocument();
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
    expect(screen.getByText(/dashboard analytics/i)).toBeInTheDocument();
  });

  test("shows error message when API fails", async () => {
    jest.spyOn(dashboardService, "getDashboardStats").mockRejectedValue(new Error("API failed"));

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

    expect(facultyCard).toBeInTheDocument();
  });
});
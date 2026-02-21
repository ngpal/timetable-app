import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "../AdminDashboard";

describe("AdminDashboard", () => {

  test("renders Admin Console title", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/admin console/i)).toBeInTheDocument();
  });

  test("renders all sidebar menu items", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();
    expect(screen.getByText(/faculty management/i)).toBeInTheDocument();
    expect(screen.getByText(/course management/i)).toBeInTheDocument();
    expect(screen.getByText(/classroom management/i)).toBeInTheDocument();
    expect(screen.getByText(/course assignments/i)).toBeInTheDocument();
    expect(screen.getByText(/view timetable/i)).toBeInTheDocument();
    expect(screen.getByText(/constraints & settings/i)).toBeInTheDocument();
  });

  test("applies active class for current route", () => {
    render(
      <MemoryRouter initialEntries={["/admin/faculty"]}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const activeLink = screen.getByText(/faculty management/i);
    expect(activeLink).toHaveClass("active");
  });

  test("logout button navigates to home", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<h1>Home Page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/logout/i));

    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });

});
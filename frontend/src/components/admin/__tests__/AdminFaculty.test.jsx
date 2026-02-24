import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminFaculty from "../AdminFaculty";
import * as facultyService from "../../../services/facultyService";

jest.mock("../../../services/facultyService");

describe("AdminFaculty", () => {

  const mockFaculty = [
    {
      _id: "1",
      name: "Dr. John Doe",
      email: "john@example.com",
      department: "Computer Science",
      designation: "Professor",
      facultyType: "Full-time",
      specialization: ["AI"],
      isClassAdvisor: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading initially and then faculty data", async () => {
    facultyService.getAllFaculty.mockResolvedValue(mockFaculty);

    render(<AdminFaculty />);

    expect(screen.getByText(/loading faculty data/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });
  });

  test("shows empty state when no faculty", async () => {
    facultyService.getAllFaculty.mockResolvedValue([]);

    render(<AdminFaculty />);

    await waitFor(() => {
      expect(
        screen.getByText(/no faculty members found/i)
      ).toBeInTheDocument();
    });
  });

  test("opens add faculty form", async () => {
    facultyService.getAllFaculty.mockResolvedValue([]);

    render(<AdminFaculty />);

    const btn = await screen.findByText(/add new faculty/i);
    fireEvent.click(btn);

    expect(screen.getByText(/add faculty details/i)).toBeInTheDocument();
  });

  test("calls deleteFaculty when delete button is clicked", async () => {
    facultyService.getAllFaculty.mockResolvedValue(mockFaculty);
    facultyService.deleteFaculty.mockResolvedValue({});

    window.confirm = jest.fn(() => true);

    render(<AdminFaculty />);

    const deleteBtn = await screen.findByTitle("Delete");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(facultyService.deleteFaculty).toHaveBeenCalledWith("1");
    });
  });

  test("opens edit form when edit button is clicked", async () => {
    facultyService.getAllFaculty.mockResolvedValue(mockFaculty);

    render(<AdminFaculty />);

    const editBtn = await screen.findByTitle("Edit");
    fireEvent.click(editBtn);

    expect(screen.getByText(/edit faculty details/i)).toBeInTheDocument();
  });

});
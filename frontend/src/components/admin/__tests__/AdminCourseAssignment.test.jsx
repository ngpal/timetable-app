import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminCourseAssignment from "../AdminCourseAssignment";

import {
  getAllCourseAssignments,
  createCourseAssignment,
  updateCourseAssignment,
  deleteCourseAssignment,
} from "../../../services/courseAssignmentService";

import { getAllCourses } from "../../../services/courseService";
import { getAllFaculty } from "../../../services/facultyService";

jest.mock("../../../services/courseAssignmentService");
jest.mock("../../../services/courseService");
jest.mock("../../../services/facultyService");

const mockCourses = [
  {
    _id: "c1",
    courseCode: "CS101",
    courseName: "DSA",
    credits: 3,
    courseType: "Theory",
  },
];

const mockFaculty = [
  {
    _id: "f1",
    name: "Dr. Smith",
    department: "CSE",
  },
];

const mockAssignments = [
  {
    _id: "a1",
    academicYear: "2025-2026",
    semester: "Odd",
    department: "CSE",
    section: "A",
    courses: [],
    classAdvisors: [],
  },
];

beforeEach(() => {
  jest.clearAllMocks();

  getAllCourseAssignments.mockResolvedValue(mockAssignments);
  getAllCourses.mockResolvedValue(mockCourses);
  getAllFaculty.mockResolvedValue(mockFaculty);
});

const openForm = async () => {
  render(<AdminCourseAssignment />);

  await waitFor(() =>
    expect(getAllCourseAssignments).toHaveBeenCalled()
  );

  await userEvent.click(
    screen.getByRole("button", { name: /\+ add new assignment/i })
  );
};

describe("AdminCourseAssignment", () => {
  test("adds faculty to course", async () => {
    await openForm();

    await userEvent.selectOptions(
      screen.getByDisplayValue("+ Add Course"),
      "c1"
    );

    await userEvent.selectOptions(
      screen.getByDisplayValue("+ Assign Faculty"),
      "f1|Incharge"
    );

    expect(
      screen.getByText(/dr\. smith \(incharge\)/i)
    ).toBeInTheDocument();
  });

  test("adds class advisor", async () => {
    await openForm();

    await userEvent.selectOptions(
      screen.getByDisplayValue("+ Add Advisor"),
      "f1"
    );

    const advisorSection = screen
      .getByText(/class advisors/i)
      .closest("div");

    expect(
      within(advisorSection).getByText(/dr\. smith/i)
    ).toBeInTheDocument();
  });

  test("creates new assignment", async () => {
    createCourseAssignment.mockResolvedValue({});

    await openForm();

    await userEvent.selectOptions(
      document.querySelector('select[name="department"]'),
      "CSE"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/e\.g., a, b, c/i),
      "A"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /save assignment/i })
    );

    await waitFor(() =>
      expect(createCourseAssignment).toHaveBeenCalled()
    );
  });

  test("edit assignment pre-fills form", async () => {
    render(<AdminCourseAssignment />);

    await waitFor(() =>
      expect(getAllCourseAssignments).toHaveBeenCalled()
    );

    await userEvent.click(screen.getAllByTitle(/edit/i)[0]);

    const deptSelect = document.querySelector(
      'select[name="department"]'
    );

    expect(deptSelect.value).toBe("CSE");

    expect(
      screen.getByDisplayValue("A")
    ).toBeInTheDocument();
  });

  test("deletes assignment", async () => {
    window.confirm = jest.fn(() => true);
    deleteCourseAssignment.mockResolvedValue({});

    render(<AdminCourseAssignment />);

    await waitFor(() =>
      expect(getAllCourseAssignments).toHaveBeenCalled()
    );

    await userEvent.click(screen.getAllByTitle(/delete/i)[0]);

    await waitFor(() =>
      expect(deleteCourseAssignment).toHaveBeenCalledWith("a1")
    );
  });
});
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminCourses from "../AdminCourses";
import * as courseService from "../../../services/courseService";

jest.mock("../../../services/courseService");

const mockCourses = [
  {
    _id: "1",
    courseCode: "CS101",
    courseName: "Data Structures",
    credits: 3,
    semester: 3,
    year: 2,
    courseType: "Core",
    department: "Computer Science",
    theoryHours: 3,
    labHours: 2,
    requiresLab: true,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AdminCourses", () => {

  test("fetches and displays courses", async () => {
    courseService.getAllCourses.mockResolvedValue(mockCourses);

    render(<AdminCourses />);

    expect(screen.getByText(/loading courses/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Data Structures")).toBeInTheDocument()
    );
  });

  test("elective category appears when elective selected", async () => {
    courseService.getAllCourses.mockResolvedValue([]);

    render(<AdminCourses />);

    await userEvent.click(screen.getByText(/add new course/i));

    const courseType = document.querySelector('select[name="courseType"]');

    await userEvent.selectOptions(courseType, "Elective");

    expect(
      screen.getByPlaceholderText(/pe-iii/i)
    ).toBeInTheDocument();
  });

  test("adds a new course", async () => {
    courseService.getAllCourses.mockResolvedValue([]);
    courseService.addCourse.mockResolvedValue({});

    render(<AdminCourses />);

    await userEvent.click(screen.getByText(/add new course/i));

    await userEvent.type(
      screen.getByPlaceholderText(/cs101/i),
      "CS102"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/data structures/i),
      "Algorithms"
    );

    await userEvent.selectOptions(
      document.querySelector('select[name="semester"]'),
      "3"
    );

    await userEvent.selectOptions(
      document.querySelector('select[name="year"]'),
      "2"
    );

    await userEvent.selectOptions(
      document.querySelector('select[name="department"]'),
      "Computer Science"
    );

    await userEvent.click(screen.getByText(/save course/i));

    await waitFor(() =>
      expect(courseService.addCourse).toHaveBeenCalled()
    );
  });

});
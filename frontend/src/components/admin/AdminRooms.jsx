import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminRooms from "../AdminRooms";

jest.mock("../../../services/classroomService.js", () => ({
  getAllClassrooms: jest.fn(),
  addClassroom: jest.fn(),
  updateClassroom: jest.fn(),
  deleteClassroom: jest.fn(),
}));

import {
  getAllClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
} from "../../../services/classroomService.js";

describe("AdminRooms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoom = {
    _id: "r1",
    roomId: "301",
    fullRoomId: "ABIII - FF-C 301",
    roomType: "Classroom",
    capacity: 60,
    building: "ABIII",
    floor: "FF",
    block: "C",
    facilities: ["Projector"],
    isAvailable: true,
  };

  test("loads and displays rooms", async () => {
    getAllClassrooms.mockResolvedValue([mockRoom]);

    render(<AdminRooms />);

    expect(screen.getByText(/loading classrooms/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("301")).toBeInTheDocument()
    );

    expect(screen.getByText(/classroom/i)).toBeInTheDocument();
  });

  test("shows empty state", async () => {
    getAllClassrooms.mockResolvedValue([]);

    render(<AdminRooms />);

    await waitFor(() =>
      expect(
        screen.getByText(/no classrooms found/i)
      ).toBeInTheDocument()
    );
  });

  test("opens add room form", async () => {
    getAllClassrooms.mockResolvedValue([]);

    render(<AdminRooms />);

    await userEvent.click(screen.getByText(/add new room/i));

    expect(
      screen.getByText(/add classroom\/lab details/i)
    ).toBeInTheDocument();
  });

  test("adds a new room", async () => {
    getAllClassrooms.mockResolvedValue([]);
    addClassroom.mockResolvedValue({});
    getAllClassrooms.mockResolvedValueOnce([]).mockResolvedValueOnce([mockRoom]);

    render(<AdminRooms />);

    await userEvent.click(screen.getByText(/add new room/i));

    await userEvent.type(
      screen.getByPlaceholderText(/301 or lab1/i),
      "301"
    );

    await userEvent.selectOptions(
      screen.getByDisplayValue("Select Building"),
      "ABIII"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/enter seating capacity/i),
      "60"
    );

    await userEvent.click(screen.getByText(/save room/i));

    await waitFor(() => expect(addClassroom).toHaveBeenCalled());
  });

  test("facility toggle works", async () => {
    getAllClassrooms.mockResolvedValue([]);

    render(<AdminRooms />);

    await userEvent.click(screen.getByText(/add new room/i));

    const projectorCheckbox = screen.getByLabelText(/projector/i);

    await userEvent.click(projectorCheckbox);

    expect(projectorCheckbox).toBeChecked();
  });

  test("edit room loads data into form", async () => {
    getAllClassrooms.mockResolvedValue([mockRoom]);

    render(<AdminRooms />);

    await waitFor(() => screen.getByText("301"));

    await userEvent.click(screen.getByTitle(/edit/i));

    expect(
      screen.getByDisplayValue("301")
    ).toBeInTheDocument();
  });

  test("updates room", async () => {
    getAllClassrooms.mockResolvedValue([mockRoom]);
    updateClassroom.mockResolvedValue({});

    render(<AdminRooms />);

    await waitFor(() => screen.getByText("301"));

    await userEvent.click(screen.getByTitle(/edit/i));

    const capacityInput = screen.getByDisplayValue("60");

    await userEvent.clear(capacityInput);
    await userEvent.type(capacityInput, "80");

    await userEvent.click(screen.getByText(/save room/i));

    await waitFor(() =>
      expect(updateClassroom).toHaveBeenCalled()
    );
  });

  test("deletes room", async () => {
    getAllClassrooms.mockResolvedValue([mockRoom]);
    deleteClassroom.mockResolvedValue({});

    window.confirm = jest.fn(() => true);

    render(<AdminRooms />);

    await waitFor(() => screen.getByText("301"));

    await userEvent.click(screen.getByTitle(/delete/i));

    await waitFor(() =>
      expect(deleteClassroom).toHaveBeenCalledWith("r1")
    );
  });

  test("cancel closes form", async () => {
    getAllClassrooms.mockResolvedValue([]);

    render(<AdminRooms />);

    await userEvent.click(screen.getByText(/add new room/i));
    await userEvent.click(screen.getByText(/cancel/i));

    expect(
      screen.queryByText(/save room/i)
    ).not.toBeInTheDocument();
  });

  test("error state is shown", async () => {
    getAllClassrooms.mockRejectedValue(new Error("API Error"));

    render(<AdminRooms />);

    await waitFor(() =>
      expect(screen.getByText(/api error/i)).toBeInTheDocument()
    );
  });
});
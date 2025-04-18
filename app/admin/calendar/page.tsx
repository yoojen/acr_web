"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventClickArg } from "@fullcalendar/core";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { CalendarEvent } from "@/interface";
import withAuth from "@/HOC/withAuth";
import components from "../components";

const calendarFields = [
  { label: "Date", field: "start" },
  { label: "Title", field: "title" },
];

const CalendarManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 1, title: "Meeting", start: "2024-03-28" },
    { id: 1, title: "Doctor Appointment", start: "2024-03-30" },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [newEvent, setNewEvent] = useState<CalendarEvent>({
    id: 0,
    title: "",
    start: "",
  });

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      alert("Event title is required!");
      return;
    }

    if (newEvent.id) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === newEvent.id
            ? { ...event, title: newEvent.title, start: newEvent.start }
            : event
        )
      );
    } else {
      const newEventId =
        events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
      setEvents([...events, { ...newEvent, id: newEventId }]);
    }

    setNewEvent({ id: 0, title: "", start: "" });
    setIsModalOpen(false);
  };

  // const handleEditEvent = (event: CalendarEvent) => {
  //   setSelectedEvent(event);
  //   setNewEvent(event);
  //   setIsModalOpen(true);
  // };

  // const handleDeleteEvent = (id: number) => {
  //   if (window.confirm("Are you sure you want to delete this event?")) {
  //     setEvents(events.filter((event) => event.id !== id));
  //   }
  // };

  const handleDateClick = (arg: DateClickArg) => {
    setNewEvent({ id: 0, title: "", start: arg.dateStr });
    setIsModalOpen(true);
  };

  const handleEventClick = (eventClick: EventClickArg) => {
    const eventStart = eventClick.event.start
      ? eventClick.event.start.toISOString().split("T")[0]
      : "";

    setSelectedEvent({
      id: Number(eventClick.event.id),
      title: eventClick.event.title,
      start: eventStart,
    });

    setNewEvent({
      id: Number(eventClick.event.id),
      title: eventClick.event.title,
      start: eventStart,
    });

    setIsModalOpen(true);
  };



  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-4">Calendar Management</h2>

      {/* Calendar */}
      {!isModalOpen && (
        <div className="bg-white shadow-md p-4 rounded-lg mb-10">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map((event) => ({
              ...event,
              id: String(event.id),
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
          />
        </div>
      )}

      {/* Events Table */}
      {/* <components.Table
        data={events}
        columns={["ID", "Date", "Title"]}
        actions={(event) => (
          <components.ActionButtons
            onEdit={() => handleEditEvent(event)}
            onDelete={() => handleDeleteEvent(event.id)}
          />
        )}
      /> */}

      {/* Modal for Adding/Editing Events */}
      <components.Modal
        isOpen={isModalOpen}
        title={selectedEvent ? "Edit Event" : "Add Event"}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null); // Reset selection on close
        }}
      >
        {calendarFields.map(({ label, field }) => (
          <components.InputField
            key={field}
            type="text"
            label={label}
            value={String(newEvent[field as keyof CalendarEvent] || "")}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                [field]: e.target.value,
              }))
            }
          />
        ))}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={handleAddEvent}
        >
          {selectedEvent ? "Update" : "Save"}
        </button>
      </components.Modal>
    </div>
  );
};

export default withAuth(CalendarManagement);
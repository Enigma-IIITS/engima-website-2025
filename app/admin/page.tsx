"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// --- Main Admin Page Component ---
export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Spinner />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <BackIcon />
          <span className="ml-2">Back to Home</span>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-neutral-400 mb-8">
          Welcome, {user.name}. Manage your club's activities.
        </p>

        <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto">
          <TabButton
            title="Manage Events"
            icon={<CalendarIcon />}
            isActive={activeTab === "events"}
            onClick={() => setActiveTab("events")}
          />
          <TabButton
            title="User Management"
            icon={<UsersIcon />}
            isActive={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <TabButton
            title="Manage Profile"
            icon={<ProfileIcon />}
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "events" && <EventManagement />}
              {activeTab === "users" && <UserManagement />}
              {activeTab === "profile" && (
                <div className="text-center p-10 bg-neutral-900 rounded-lg border border-neutral-800">
                  <p className="text-neutral-400">
                    Profile management coming soon.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Event Management Component ---
const EventManagement = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regStats, setRegStats] = useState<any | null>(null);
  const [isRsvpLoading, setIsRsvpLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setEvents(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };
  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    )
      return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Event deleted successfully");
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event.");
    }
  };

  const handleSaveSuccess = (updatedEvent: any) => {
    const isEditing = events.some((e) => e._id === updatedEvent._id);
    if (isEditing) {
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
      );
    } else {
      setEvents((prevEvents) => [updatedEvent, ...prevEvents]);
    }
  };

  const handleViewRsvps = async (event: any) => {
    setViewingEvent(event);
    setIsRsvpModalOpen(true);
    setIsRsvpLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/rsvp/event/${event._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setRegistrations(res.data.data.registrations);
        setRegStats(res.data.data.stats);
      }
    } catch (error) {
      console.error(`Failed to fetch RSVPs for event ${event._id}`, error);
    } finally {
      setIsRsvpLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CalendarIcon /> All Events
        </h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-black font-bold rounded-lg hover:bg-green-500 transition-transform hover:scale-105 active:scale-95"
        >
          <PlusIcon /> Create Event
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-white">{event.title}</h3>
                  <p className="text-sm text-neutral-400">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <StatusBadge status={event.status} />
                  <IconButton
                    onClick={() => handleViewRsvps(event)}
                    tooltip="View RSVPs"
                  >
                    <EyeIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEdit(event)}
                    tooltip="Edit Event"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(event._id)}
                    tooltip="Delete Event"
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No events have been created yet." />
          )}
        </div>
      )}
      <AnimatePresence>
        {isEventModalOpen && (
          <EventModal
            event={editingEvent}
            onClose={() => setIsEventModalOpen(false)}
            onSave={handleSaveSuccess}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isRsvpModalOpen && viewingEvent && (
          <RegistrationsModal
            isOpen={isRsvpModalOpen}
            onClose={() => setIsRsvpModalOpen(false)}
            event={viewingEvent}
            registrations={registrations}
            stats={regStats}
            isLoading={isRsvpLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- User Management Component ---
const UserManagement = () => {
  const { user: adminUser, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setUsers(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handlePromote = async (userId: string) => {
    if (!window.confirm("Are you sure you want to promote this user to Admin?"))
      return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/role`,
        { role: "admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User promoted to admin successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Failed to promote user", error);
      alert("Failed to promote user.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <UsersIcon /> All Users
      </h2>
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-white">{user.name}</h3>
                  <p className="text-sm text-neutral-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <RoleBadge role={user.role} />
                  {user.role !== "admin" && user._id !== adminUser?._id && (
                    <button
                      onClick={() => handlePromote(user._id)}
                      className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Promote to Admin
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No other users found." />
          )}
        </div>
      )}
    </div>
  );
};

// --- Registrations Modal Component ---
const RegistrationsModal = ({
  isOpen,
  onClose,
  event,
  registrations,
  stats,
  isLoading,
}: any) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl h-[90vh] rounded-lg p-6 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-2 text-white">
          Registrations for{" "}
          <span className="text-green-400">{event.title}</span>
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <CloseIcon />
        </button>
        {stats && (
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full">
              Total: {stats.total || 0}
            </span>
            <span className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full">
              Confirmed: {stats.confirmed || 0}
            </span>
            <span className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full">
              Pending: {stats.pending || 0}
            </span>
            <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full">
              Waitlist: {stats.waitlist || 0}
            </span>
          </div>
        )}
        <div className="flex-grow overflow-y-auto mt-4 border border-neutral-800 rounded-lg">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Spinner />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-800 sticky top-0">
                <tr className="text-neutral-300">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {registrations.length > 0 ? (
                  registrations.map((rsvp: any) => (
                    <tr
                      key={rsvp._id}
                      className="hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="p-3 font-medium text-white">
                        {rsvp.user?.name || "N/A"}
                      </td>
                      <td className="p-3 text-neutral-400">
                        {rsvp.contactInfo?.email}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={rsvp.status} />
                      </td>
                      <td className="p-3 text-neutral-400">
                        {new Date(rsvp.registeredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState message="No registrations found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Event Creation/Editing Modal ---
const EventModal = ({
  event,
  onClose,
  onSave,
}: {
  event: any | null;
  onClose: () => void;
  onSave: (updatedEvent: any) => void;
}) => {
  const { token } = useAuth();
  const isEditing = event !== null;
  const API_ROOT = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "");

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    category: event?.category || "technical",
    eventType: event?.eventType || "offline",
    status: event?.status || "draft",
    startDate: event?.startDate
      ? new Date(event.startDate).toISOString().substring(0, 16)
      : "",
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().substring(0, 16)
      : "",
    registrationEndDate: event?.registrationEndDate
      ? new Date(event.registrationEndDate).toISOString().substring(0, 16)
      : "",
    venue: event?.venue || "",
    onlineLink: event?.onlineLink || "",
    maxParticipants: event?.maxParticipants || 50,
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    event?.poster ? `${API_ROOT}${event.poster}` : null
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleTextChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (file: File | null) => {
    if (file) {
      setPosterFile(file);
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl); // Clean up old blob
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleDragEvents = (
    e: React.DragEvent<HTMLLabelElement>,
    action: "enter" | "leave" | "drop"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === "enter") setIsDragging(true);
    if (action === "leave") setIsDragging(false);
    if (action === "drop") {
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) handleFileChange(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      submissionData.append(key, String(value))
    );
    if (posterFile) submissionData.append("poster", posterFile);

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${event._id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/events`;
    const method = isEditing ? "put" : "post";
    try {
      const response = await axios({
        method,
        url,
        data: submissionData,
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Event ${isEditing ? "updated" : "created"} successfully!`);
      onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error("Failed to save event", error);
      alert("Failed to save event.");
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Event" : "Create New Event"}
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <CloseIcon />
        </button>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-2"
        >
          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleTextChange}
            required
          />
          <FormTextArea
            label="Description"
            name="description"
            value={formData.description}
            rows={5}
            onChange={handleTextChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Event Poster
            </label>
            <label
              htmlFor="poster-upload"
              onDragEnter={(e) => handleDragEvents(e, "enter")}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => handleDragEvents(e, "leave")}
              onDrop={(e) => handleDragEvents(e, "drop")}
              className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-neutral-600 border-dashed rounded-md cursor-pointer transition-colors ${
                isDragging
                  ? "border-green-500 bg-green-500/10"
                  : "hover:border-neutral-500"
              }`}
            >
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Poster preview"
                    className="mx-auto h-40 max-w-full object-contain rounded-md"
                  />
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-neutral-500"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8l10 10m0 0v12a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4h12z"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-sm text-neutral-400">
                      <span className="font-semibold text-green-400">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, GIF, WEBP up to 5MB
                    </p>
                  </>
                )}
              </div>
            </label>
            <input
              id="poster-upload"
              name="poster"
              type="file"
              className="sr-only"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleTextChange}
              options={[
                "technical",
                "workshop",
                "competition",
                "cultural",
                "sports",
                "seminar",
                "other",
              ]}
            />
            <FormSelect
              label="Event Type"
              name="eventType"
              value={formData.eventType}
              onChange={handleTextChange}
              options={["offline", "online", "hybrid"]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleTextChange}
              required
            />
            <FormInput
              label="End Date"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleTextChange}
              required
            />
          </div>
          <FormInput
            label="Registration End Date"
            name="registrationEndDate"
            type="datetime-local"
            value={formData.registrationEndDate}
            onChange={handleTextChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Venue (for offline/hybrid)"
              name="venue"
              value={formData.venue}
              onChange={handleTextChange}
            />
            <FormInput
              label="Online Link (for online/hybrid)"
              name="onlineLink"
              value={formData.onlineLink}
              onChange={handleTextChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Max Participants"
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleTextChange}
            />
            <FormSelect
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleTextChange}
              options={[
                "draft",
                "published",
                "ongoing",
                "completed",
                "cancelled",
              ]}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-neutral-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-black font-bold rounded-lg hover:bg-green-500 transition-colors"
            >
              Save Event
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- UI & Helper Components ---
const TabButton = ({ title, isActive, onClick, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "border-b-2 border-green-500 text-white"
        : "text-neutral-500 hover:text-neutral-300 border-b-2 border-transparent"
    }`}
  >
    {icon}
    {title}
  </button>
);
const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);
const FormInput = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-neutral-300 mb-1">
      {label}
    </label>
    <input
      className="block w-full bg-neutral-800 border-neutral-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      {...props}
    />
  </div>
);
const FormTextArea = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-neutral-300 mb-1">
      {label}
    </label>
    <textarea
      rows={props.rows || 4}
      className="block w-full bg-neutral-800 border-neutral-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      {...props}
    />
  </div>
);
const FormSelect = ({ label, options, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-neutral-300 mb-1">
      {label}
    </label>
    <select
      className="block w-full bg-neutral-800 border-neutral-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      {...props}
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);
const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
);
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center p-10">
    <p className="text-neutral-500">{message}</p>
  </div>
);
const IconButton = ({
  onClick,
  children,
  className = "text-neutral-400 hover:bg-neutral-800",
  tooltip,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  tooltip: string;
}) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`p-2 rounded-full transition-colors ${className}`}
  >
    {children}
  </button>
);
const StatusBadge = ({ status }: { status: string }) => {
  const styles: { [key: string]: string } = {
    published: "bg-green-900/70 text-green-300",
    confirmed: "bg-green-900/70 text-green-300",
    attended: "bg-blue-900/70 text-blue-300",
    draft: "bg-yellow-900/70 text-yellow-300",
    pending: "bg-yellow-900/70 text-yellow-300",
    cancelled: "bg-red-900/70 text-red-300",
    waitlist: "bg-purple-900/70 text-purple-300",
  };
  const style = styles[status] || "bg-neutral-700 text-neutral-300";
  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${style}`}
    >
      {status}
    </span>
  );
};
const RoleBadge = ({ role }: { role: string }) => {
  const styles =
    role === "admin"
      ? "bg-green-900 text-green-300"
      : "bg-neutral-700 text-neutral-300";
  return (
    <span
      className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${styles}`}
    >
      {role}
    </span>
  );
};

// --- SVG Icons ---
const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L13.2-1.768z"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const UsersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
const ProfileIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

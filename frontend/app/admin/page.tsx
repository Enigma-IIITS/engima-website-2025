"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// --- Main Admin Page Component ---
export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 🚀 LEADER POSITIONS: Only these club ranks can promote others or delete events
  const LEAD_POSITIONS = ["president", "vice_president", "team_lead"];

  useEffect(() => {
    if (token) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/members/my-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) setMemberProfile(res.data.data);
        })
        .catch(() => setMemberProfile(null))
        .finally(() => setIsProfileLoading(false));
    }
  }, [token]);

  // Determine if the current admin is a Lead
  const isLead =
    memberProfile?.roles?.some(
      (r: any) =>
        r.isActive && LEAD_POSITIONS.includes(r.position.toLowerCase())
    ) ||
    LEAD_POSITIONS.includes(
      memberProfile?.primaryRole?.position?.toLowerCase()
    );

  if (loading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Spinner />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <BackIcon />
          <span className="ml-2">Back to Home</span>
        </Link>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-neutral-400">
              Welcome, {user.name}.{" "}
              {isLead
                ? "Control Panel Access Granted."
                : "Club Management Access."}
            </p>
          </div>
          <div className="text-[10px] bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-zinc-500 font-mono tracking-widest uppercase">
            Privilege: {isLead ? "Lead Admin" : "Club Member"}
          </div>
        </div>

        <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto no-scrollbar">
          <TabButton
            title="Events"
            icon={<CalendarIcon />}
            isActive={activeTab === "events"}
            onClick={() => setActiveTab("events")}
          />
          <TabButton
            title={isLead ? "User Management" : "Club Roster"}
            icon={<UsersIcon />}
            isActive={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <TabButton
            title="Stickers"
            icon={<StickerIcon />}
            isActive={activeTab === "stickers"}
            onClick={() => setActiveTab("stickers")}
          />
          <TabButton
            title="Feedback"
            icon={<FeedbackIcon />}
            isActive={activeTab === "feedback"}
            onClick={() => setActiveTab("feedback")}
          />
          <TabButton
            title="My Profile"
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
              {activeTab === "events" && <EventManagement isLead={isLead} />}
              {activeTab === "users" && <UserManagement isLead={isLead} />}
              {activeTab === "stickers" && <StickerManagement />}
              {activeTab === "feedback" && <FeedbackManagement />}
              {activeTab === "profile" && <ProfileManagement />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Event Management ---
const EventManagement = ({ isLead }: { isLead: boolean }) => {
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) setEvents(res.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      alert("Deleted.");
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleViewRsvps = async (event: any) => {
    setViewingEvent(event);
    setIsRsvpModalOpen(true);
    setIsRsvpLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/rsvp/event/${event._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setRegistrations(res.data.data.registrations);
        setRegStats(res.data.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRsvpLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CalendarIcon /> Club Events
        </h2>
        <button
          onClick={() => {
            setEditingEvent(null);
            setIsEventModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-black font-bold rounded-lg hover:bg-green-500 transition-transform"
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
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-white">{event.title}</h3>
                <p className="text-sm text-neutral-400">
                  {new Date(event.startDate).toDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={event.status} />
                <IconButton
                  onClick={() => handleViewRsvps(event)}
                  tooltip="View RSVPs"
                >
                  <EyeIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setEditingEvent(event);
                    setIsEventModalOpen(true);
                  }}
                  tooltip="Edit"
                >
                  <EditIcon />
                </IconButton>
                {isLead && (
                  <IconButton
                    onClick={() => handleDelete(event._id)}
                    tooltip="Delete"
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <TrashIcon />
                  </IconButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {isEventModalOpen && (
          <EventModal
            event={editingEvent}
            onClose={() => setIsEventModalOpen(false)}
            onSave={fetchEvents}
          />
        )}
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

// --- User Management ---
const UserManagement = ({ isLead }: { isLead: boolean }) => {
  const { user: adminUser, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) setUsers(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const action = newRole === "admin" ? "promote" : "demote";
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User ${action}d successfully.`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`Failed to ${action} user.`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <UsersIcon /> {isLead ? "Manage Members" : "Club Roster"}
      </h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <div
              key={u._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center transition-all hover:border-neutral-700"
            >
              <div>
                <h3 className="font-bold text-white">{u.name}</h3>
                <p className="text-sm text-neutral-500">{u.email}</p>
                <div className="mt-2">
                  <RoleBadge role={u.role} />
                </div>
              </div>

              {/* 🚀 Lead-only controls */}
              {isLead && u._id !== adminUser?._id && (
                <div className="flex gap-2">
                  {u.role !== "admin" ? (
                    <button
                      onClick={() => handleUpdateRole(u._id, "admin")}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl transition-all"
                    >
                      Promote to Member
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateRole(u._id, "user")}
                      className="text-xs bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white font-bold py-2 px-4 rounded-xl transition-all"
                    >
                      Demote to User
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Sticker Management ---
const StickerManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) setUsers(res.data.data.data);
    };
    fetchUsers();
  }, [token]);

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !file) return alert("Select user and image");
    setLoading(true);
    const data = new FormData();
    data.append("stickerName", formData.name);
    data.append("message", formData.message);
    data.append("stickerImage", file);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/award-sticker/${selectedUserId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Awarded!");
      setFormData({ name: "", message: "" });
      setFile(null);
    } catch (err) {
      alert("Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <StickerIcon className="text-green-400" /> Award New Sticker
      </h2>
      <form onSubmit={handleAward} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Recipient
          </label>
          <select
            className="w-full bg-black border border-neutral-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setSelectedUserId(e.target.value)}
            value={selectedUserId}
          >
            <option value="">-- Choose User --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <FormInput
          label="Badge Name"
          value={formData.name}
          onChange={(e: any) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="e.g. Code Ninja"
          required
        />
        <FormTextArea
          label="Recognition Message"
          value={formData.message}
          onChange={(e: any) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Why are they being recognized?"
          required
        />
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase">
            Sticker Asset
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-600 file:text-black font-bold cursor-pointer"
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-green-600 text-black font-black py-4 rounded-xl mt-4 hover:bg-green-500 transition-all"
        >
          {loading ? "PROCESSING..." : "AWARD ACHIEVEMENT"}
        </button>
      </form>
    </div>
  );
};

// --- Feedback Management ---
const FeedbackManagement = () => {
  const { token } = useAuth();
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setFeedbackItems(res.data.data.feedback))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <FeedbackIcon /> Inbox
      </h2>
      {isLoading ? (
        <Spinner />
      ) : (
        feedbackItems.map((item) => (
          <div
            key={item._id}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 transition-all hover:border-neutral-600"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                    {item.type}
                  </span>
                  {item.event && (
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                      Event: {item.event.title}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm text-neutral-500">
                  From: {item.user?.name}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={item.status} />
                {item.ratings?.overall && (
                  <div className="mt-2 text-yellow-500">
                    {"★".repeat(item.ratings.overall)}
                    {"☆".repeat(5 - item.ratings.overall)}
                  </div>
                )}
              </div>
            </div>
            <p className="text-neutral-300 bg-black/30 p-4 rounded-xl border border-neutral-800">
              {item.content}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

// --- Profile Management Component ---
const ProfileManagement = () => {
  const { token } = useAuth();
  const API_ROOT = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "");

  const [profile, setProfile] = useState<any>({
    displayName: "",
    tagline: "",
    bio: "",
    contact: { linkedIn: "", github: "", portfolio: "" },
    social: { twitter: "" },
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/my-profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data.success && res.data.data) {
            const fetchedData = res.data.data;
            const fullProfile = {
              ...{ displayName: "", tagline: "", bio: "" },
              ...fetchedData,
              contact: {
                linkedIn: "",
                github: "",
                portfolio: "",
                ...fetchedData.contact,
              },
              social: { twitter: "", ...fetchedData.social },
            };
            setProfile(fullProfile);
            if (fetchedData.media?.profilePicture?.url) {
              setPreviewUrl(
                `${API_ROOT}${fetchedData.media.profilePicture.url}`
              );
            }
          }
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error("Failed to fetch profile", error);
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [token, API_ROOT]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfile((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setProfilePicFile(file);
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = new FormData();

    submissionData.append("contact", JSON.stringify(profile.contact));
    submissionData.append("social", JSON.stringify(profile.social));
    submissionData.append("displayName", profile.displayName);
    submissionData.append("tagline", profile.tagline);
    submissionData.append("bio", profile.bio);

    if (profilePicFile) {
      submissionData.append("profilePicture", profilePicFile);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members`,
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Profile updated successfully!");
      if (response.data.data.media?.profilePicture?.url) {
        setPreviewUrl(
          `${API_ROOT}${response.data.data.media.profilePicture.url}`
        );
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ProfileIcon /> Your Member Profile
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-neutral-900 border border-neutral-800 rounded-lg p-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div>
            <label
              htmlFor="profile-pic-upload"
              className="cursor-pointer group"
            >
              <div className="w-32 h-32 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-600 group-hover:border-green-500 transition-colors flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-neutral-500 text-xs text-center p-2">
                    Upload Photo
                  </span>
                )}
              </div>
            </label>
            <input
              id="profile-pic-upload"
              type="file"
              className="sr-only"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              accept="image/*"
            />
          </div>
          <div className="flex-grow w-full space-y-4">
            <FormInput
              label="Display Name"
              name="displayName"
              value={profile.displayName}
              onChange={handleTextChange}
              placeholder="Your public name"
            />
            <FormInput
              label="Tagline"
              name="tagline"
              value={profile.tagline}
              onChange={handleTextChange}
              placeholder="e.g., Full Stack Developer | Cybersecurity Enthusiast"
            />
          </div>
        </div>
        <FormTextArea
          label="Bio"
          name="bio"
          value={profile.bio}
          onChange={handleTextChange}
          rows={5}
          placeholder="A short bio about your interests and skills."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="GitHub URL"
            name="contact.github"
            value={profile.contact.github}
            onChange={handleTextChange}
            placeholder="https://github.com/..."
          />
          <FormInput
            label="LinkedIn URL"
            name="contact.linkedIn"
            value={profile.contact.linkedIn}
            onChange={handleTextChange}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Portfolio/Website"
            name="contact.portfolio"
            value={profile.contact.portfolio}
            onChange={handleTextChange}
            placeholder="https://your.website"
          />
          <FormInput
            label="Twitter URL"
            name="social.twitter"
            value={profile.social.twitter}
            onChange={handleTextChange}
            placeholder="https://twitter.com/..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800 mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-black font-bold rounded-lg hover:bg-green-500 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </form>
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
        URL.revokeObjectURL(previewUrl);
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
              Event Poster (File limit: 10 MB)
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

// --- Reusable UI Elements (Badges, Buttons, etc.) ---
const TabButton = ({ title, isActive, onClick, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap px-6 py-4 text-sm font-bold transition-all ${
      isActive
        ? "border-b-2 border-green-500 text-white bg-green-500/5"
        : "text-neutral-500 hover:text-neutral-300 border-b-2 border-transparent"
    }`}
  >
    {icon} {title}
  </button>
);
const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    published: "bg-green-900/50 text-green-400 border-green-500/20",
    draft: "bg-yellow-900/50 text-yellow-400 border-yellow-500/20",
    cancelled: "bg-red-900/50 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
        styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"
      }`}
    >
      {status}
    </span>
  );
};
const RoleBadge = ({ role }: { role: string }) => (
  <span
    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
      role === "admin"
        ? "bg-green-900/50 text-green-400 border-green-500/20"
        : "bg-zinc-800 text-zinc-400 border-zinc-700"
    }`}
  >
    {role === "admin" ? "Club Member" : "Standard User"}
  </span>
);

// --- Icons & Form Fields ---
const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
);
const FormInput = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
      {label}
    </label>
    <input
      className="w-full bg-black border border-neutral-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-green-500"
      {...props}
    />
  </div>
);
const FormTextArea = ({ label, rows = 4, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
      {label}
    </label>
    <textarea
      rows={rows}
      className="w-full bg-black border border-neutral-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-green-500 resize-none"
      {...props}
    />
  </div>
);
const FormSelect = ({ label, options, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
      {label}
    </label>
    <select
      className="w-full bg-black border border-neutral-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-green-500"
      {...props}
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt.toUpperCase()}
        </option>
      ))}
    </select>
  </div>
);
const IconButton = ({
  onClick,
  children,
  className = "text-neutral-400",
  tooltip,
}: any) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`p-2 rounded-lg transition-colors hover:bg-zinc-800 ${className}`}
  >
    {children}
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
const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
const StickerIcon = ({ className }: { className?: string }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
    />
  </svg>
);
const FeedbackIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);
const ProfileIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L13.2 -1.768z"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

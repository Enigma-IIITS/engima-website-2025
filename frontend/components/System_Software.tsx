import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo1() {
  const teamLead = [{ title: "Team Lead", src: "/kshitij.jpg" }];

  const coreMembers = [
    { title: "Core Member", src: "/chirag.jpg" },
    { title: "Core Member", src: "/uday.jpg" },
  ];

  const members = [
    { title: "Member", src: "/ramakrishna.jpg" },
    { title: "Member", src: "/aarush.jpg" },
    { title: "Member", src: "/aaditya.jpg" },
  ];

  return (
    <div className="flex flex-col gap-0 items-center -space-y-5">
      {/* --- Row 1: Team Lead (Largest) --- */}
      <div className="w-full py-1 px-1 sm:px-6 lg:px-8">
        <FocusCards
          cards={teamLead}
          heading="System Software"
          subheading="Lead and core members"
        />
      </div>

      {/* --- Row 2: Core Members (Medium) --- */}
      <div className="w-full py-1 px-1 sm:px-6 lg:px-8">
        <FocusCards cards={coreMembers} />
      </div>

      {/* --- Row 3: Members (Smallest) --- */}
      <div className="w-full py-1 px-1 sm:px-6 lg:px-8">
        <FocusCards cards={members} />
      </div>
    </div>
  );
}

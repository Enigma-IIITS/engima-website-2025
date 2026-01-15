import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo2() {
  // --- Data Split into Hierarchical Tiers ---

  const teamLead = [{ title: "Team Lead", src: "/rithvik.jpg" }];

  const coreMembers = [
    { title: "Core Member", src: "/kaamraan.jpg" },
    { title: "Core Member", src: "/pranjal.jpg" },
    { title: "Core Member", src: "/shri_charan.jpeg" },
    { title: "Core Member", src: "/vaitish.jpg" },
  ];

  const members = [
    { title: "Member", src: "/prathistha.png" },
    { title: "Member", src: "/raniel_babu.png" },
    { title: "Member", src: "/hariprasad.jpg" },
    { title: "Member", src: "/sri_charan.jpg" },
  ];

  return (
    <div className="flex flex-col gap-0 items-center -space-y-5 ">
      {/* --- Row 1: Team Lead --- */}
      <div className="w-full py-1 px-1 sm:px-6 lg:px-8">
        <FocusCards
          cards={teamLead}
          heading="Web Engineering"
          subheading="Lead and core members"
        />
      </div>

      {/* --- Row 2: Core Members --- */}
      <div className="w-full py-1 px-1 sm:px-6 lg:px-8">
        <FocusCards cards={coreMembers} />
      </div>

      {/* --- Row 3: Members --- */}
      <div className="w-full py-1 px-1 sm:px-6 lg:px-8">
        <FocusCards cards={members} />
      </div>
    </div>
  );
}

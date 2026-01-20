import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo5() {
  // --- Data Split into Hierarchical Tiers ---

  const teamLead = [{ title: "Team Lead", src: "/sai_vivash.jpg" }];

  const members = [
    { title: "Member", src: "/hetanshu.jpeg" },
    { title: "Member", src: "/aaryaman.jpg" },
    { title: "Member", src: "/hasini.jpg" },
    { title: "Member", src: "/kaarthik.jpg" },
    { title: "Member", src: "/suryansh.jpg" },
    { title: "Member", src: "/tanvi.jpg" },
    { title: "Member", src: "/sasidhar.jpg" },
    { title: "Member", src: "/sibi_saran.jpg" },
    { title: "Member", src: "/aarav.jpg" },
    { title: "Member", src: "/hanvitha.jpg" },
    { title: "Member", src: "/gayathri.jpg" },
  ];

  return (
    <div className="flex flex-col gap-8 items-center bg-black min-h-screen">
      {/* --- Row 1: Team Lead (Standalone with Header) --- */}
      <div className="w-full">
        <FocusCards
          cards={teamLead}
          heading="PR and Management"
          subheading="Lead and core members"
        />
      </div>

      {/* --- Row 2: Members (Displayed in 4 columns via the UI component) --- */}
      <div className="w-full -mt-20">
        {/* We use -mt-20 to offset the internal py-16 of the component 
            to create a clean gap without it being too large */}
        <FocusCards cards={members} />
      </div>
    </div>
  );
}

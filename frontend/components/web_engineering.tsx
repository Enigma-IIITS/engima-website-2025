// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo2() {
  const cards = [
    {
      title: "Team Lead",
      src: "/rithvik.jpg",
    },
    {
      title: "Core Member",
      src: "/kaamraan.jpg",
    },
    {
      title: "Core Member",
      src: "/pranjal.jpg",
    },
    {
      title: "Core Member",
      src: "/shri_charan.jpeg",
    },
    {
      title: "Core Member",
      src: "/vaitish.jpg",
    },
    // Add or remove cards to test centering
  
    {
      title: "Member",
      src: "/prathistha.png",
    },
    {
      title: "Member",
      src: "/raniel_babu.png",
    },
    {
      title: "Member",
      src: "/hariprasad.jpg",
    },
    {
      title: "Member",
      src: "/sri_charan.jpg",
    },
  
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <FocusCards
        cards={cards}
        heading="Web Engineering"
        subheading="Lead and core members"
      />
    </div>
  );
}
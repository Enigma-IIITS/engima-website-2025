// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo3() {
  const cards = [
    {
      title: "Team Lead",
      src: "/blank.jpg",
    },
    {
      title: "Core Member",
      src: "/govardhan.jpg",
    },
    {
      title: "Core Member",
      src: "/dheeraj.jpg",
    },
    {
      title: "Member",
      src: "/utkarsh.jpg",
    },
    // Add or remove cards to test centering
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <FocusCards
        cards={cards}
        heading="Video Editing"
        subheading="Lead and core members"
      />
    </div>
  );
}
// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo1() {
  const cards = [
    {
      title: "Team Lead",
      src: "/kshitij.jpg",
    },
    {
      title: "Core Member",
      src: "/chirag.jpg",
    },
    {
      title: "Core Member",
      src: "/uday.jpg",
    },
      {
      title: "Member",
      src: "/ramakrishna.jpg",
    },
      {
      title: "Member",
      src: "/aarush.jpg",
    },
      {
      title: "Member",
      src: "/aaditya.jpg",
    },
    

    // Add or remove cards to test centering
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <FocusCards
        cards={cards}
        heading="System Software"
        subheading="Lead and core members"
      />
    </div>
  );
}
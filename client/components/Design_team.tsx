// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo4() {
  const cards = [
    {
      title: "Team Lead",
      src: "/sanjay.jpg",
    },
    {
      title: "Member",
      src: "/aadithya.jpg",
    },
    {
      title: "Member",
      src: "/piyali.jpg",
    },
    {
      title: "Member",
      src: "/Sai_sahasra.jpg",
    },
    // Add or remove cards to test centering
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <FocusCards
        cards={cards}
        heading="Design"
        subheading="Lead and core members"
      />
    </div>
  );
}
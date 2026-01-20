// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo() {
  const cards = [
    {
      title: "Lead",
      src: "/sai_tej.jpg",
    },
    {
      title: "Co-Lead",
      src: "/Daksh_kumar.jpg",
    },
    {
      title: "Co-ordinator",
      src: "/Sripathy_siddhartha.jpg",
    },
    // Add or remove cards to test centering
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <FocusCards
        cards={cards}
        heading="Meet The Team"
        subheading="Lead and Co-Lead"
      />
    </div>
  );
}
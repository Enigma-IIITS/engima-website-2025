// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo() {
  const cards = [
    {
      title: "Team Lead",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Team Co-Lead",
      src: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Team Co-Lead",
      src: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
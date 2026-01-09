// components/FocusCardsDemo.tsx
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo5() {
  const cards = [
    {
      title: "Team Lead",
      src: "/sai_vivash.jpg",
    },
    {
      title: "Member",
      src: "/hetanshu.jpeg",
    },
    {
      title: "Member",
      src: "/aaryaman.jpg",
    },
    {
      title: "Member",
      src: "/hasini.jpg",
    },
    {
      title: "Member",
      src: "/kaarthik.jpg",
    },
    {
      title: "Member",
      src: "/suryansh.jpg",
    },
    {
      title: "Member",
      src: "/tanvi.jpg",
    },
    {
      title: "Member",
      src: "/sasidhar.jpg",
    },
    {
      title: "Member",
      src: "/sibi_saran.jpg",
    },
    {
      title: "Member",
      src: "/aarav.jpg",
    },
    {
      title: "Member",
      src: "/hanvitha.jpg",
    },
    {
      title: "Member",
      src: "/gayathri.jpg",
    },
    // Add or remove cards to test centering
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <FocusCards
        cards={cards}
        heading="PR and Management"
        subheading="Lead and core members"
      />
    </div>
  );
}
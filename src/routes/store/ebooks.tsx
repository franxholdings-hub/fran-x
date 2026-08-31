import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/store/CategoryPage";

export const Route = createFileRoute("/store/ebooks")({
  head: () => ({
    meta: [
      { title: "Business E-Books | FRAN-X Digital Store" },
      { name: "description", content: "Practical e-books and guides for Nigerian entrepreneurs and SMEs." },
    ],
  }),
  component: () => <CategoryPage categoryId="ebooks" />,
});

import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/store/CategoryPage";

export const Route = createFileRoute("/store/finance")({
  head: () => ({
    meta: [
      { title: "Financial Management Guides | FRAN-X Digital Store" },
      { name: "description", content: "Educational financial management guides for personal and business finance." },
    ],
  }),
  component: () => <CategoryPage categoryId="finance" />,
});

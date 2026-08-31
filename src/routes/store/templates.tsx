import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/store/CategoryPage";

export const Route = createFileRoute("/store/templates")({
  head: () => ({
    meta: [
      { title: "Business Templates | FRAN-X Digital Store" },
      { name: "description", content: "Ready-to-use business plan, invoice, company profile, marketing and financial projection templates." },
    ],
  }),
  component: () => <CategoryPage categoryId="templates" />,
});

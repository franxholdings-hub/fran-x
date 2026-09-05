import { createFileRoute } from "@tanstack/react-router";
import { FrixWorkspace } from "@/components/frix/FrixWorkspace";

export const Route = createFileRoute("/_authenticated/frix-ai/workspace")({
  head: () => ({
    meta: [
      { title: "FRIX AI Workspace | FRAN-X Technologies" },
      {
        name: "description",
        content: "Your intelligent AI workspace — chat, modes, tools, conversation history and usage, all in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FrixWorkspace,
});

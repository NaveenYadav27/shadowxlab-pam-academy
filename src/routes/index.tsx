import { createFileRoute } from "@tanstack/react-router";
import { PamAcademy } from "@/components/pam-academy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        name: "description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { property: "og:title", content: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        property: "og:description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { property: "og:url", content: "https://cyberark.shadowxlab.com/" },
      { property: "og:image", content: "https://cyberark.shadowxlab.com/og-image.png" },
    ],
  }),
  component: Index,
});

function Index() {
  return <PamAcademy />;
}

import { createFileRoute } from "@tanstack/react-router";
import { PamAcademy } from "@/components/pam-academy";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <PamAcademy />;
}

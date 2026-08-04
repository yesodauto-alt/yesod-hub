import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/comunidade")({
  beforeLoad: () => {
    throw redirect({ to: "/hub", replace: true });
  },
  component: () => null,
});

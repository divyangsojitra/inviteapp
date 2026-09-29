import type { Metadata } from "next";
import { HostDashboard } from "./host-dashboard";

export const metadata: Metadata = {
  title: "Host Dashboard | Invieasy",
  description: "Create and manage Invieasy event invitations."
};

export default function HostPage() {
  return <HostDashboard />;
}

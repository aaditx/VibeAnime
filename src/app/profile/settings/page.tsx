import { auth } from "@/auth";
import { getUserProfile } from "@/lib/userDb";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const metadata = { title: "Profile Settings | VibeAnime" };

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const profile = await getUserProfile(session.user.id!);

    return (
        <SettingsClient
            user={{ name: session.user.name!, email: session.user.email! }}
            profile={profile}
        />
    );
}

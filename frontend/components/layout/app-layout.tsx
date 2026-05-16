import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { GridContainer } from "./grid-container";
import { RightSidebar } from "./right-sidebar";
import { ProfileModal } from "../modals/profile-modal";
import { LeaderboardModal } from "../modals/leaderboard-modal";
import { HelpModal } from "../modals/help-modal";
export function AppLayout() {
    return (
        <div className="flex h-[100dvh] w-full flex-col bg-zinc-950 text-white overflow-hidden">
            <ProfileModal />
            <LeaderboardModal />
            <HelpModal />
            <AppHeader />

            <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                {/* Left Sidebar - Your Info & Players */}
                <aside className="hidden w-[260px] flex-col border-r border-white/5 bg-zinc-950 lg:flex">
                    <AppSidebar />
                </aside>

                {/* Main Grid Area */}
                <section className="flex flex-1 flex-col overflow-hidden bg-[#05070a]">
                    <GridContainer />
                </section>

                {/* Right Sidebar - Activity & Chat */}
                <aside className="hidden w-[320px] flex-col border-l border-white/5 bg-zinc-950 lg:flex">
                    <RightSidebar />
                </aside>
            </main>

            <AppFooter />
        </div>
    );
}
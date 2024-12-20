import { PromptArchiveDialog } from "@/components/Prompt/prompt-archive-dialog";
import { ExperimentSelector } from "@/components/Selectors/ExperimentSelector";
import FormGridParams from "@/components/form-grid-params";
import { ModeToggle } from "@/components/mode-toggle";
import GridResultsPane from "@/components/results/grid-results-pane";
import { SettingsDialog } from "@/components/settings-dialog";

function Layout() {
  return (
    <div className="fixed flex h-screen w-full flex-col">
      {/* nav */}
      <header className="flex h-16 items-center justify-between bg-zinc-950 px-4 md:px-6">
        <span className="flex items-center gap-2">
          <h2 className="font-lcd text-3xl font-semibold text-cyan-400">
            Ollama Grid Search
          </h2>
        </span>
        <nav className="hidden gap-4 md:flex">
          <PromptArchiveDialog />
          <ModeToggle />
          <ExperimentSelector />
          <SettingsDialog />
        </nav>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="w-[483px] gap-6 border-r border-gray-200 p-4 dark:border-gray-800">
          <FormGridParams />
        </div>

        {/* main div */}
        <main className="m-4 flex-1 py-0">
          <div className="text-gray-500 dark:text-gray-400">
            <GridResultsPane />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

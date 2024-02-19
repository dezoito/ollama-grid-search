import { ModeToggle } from "@/components/mode-toggle";
import GridResultsPane from "@/components/results/grid-results-pane";
import { SettingsDialog } from "@/components/settings-dialog";
import FormGridParams from "@/components/ui/form-grid-params";

function Layout() {
  // const [name, setName] = useState("");
  // const [models, setModels] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-screen fixed w-full">
      {/* nav */}
      <header className="flex h-16 items-center justify-between px-4 md:px-6 bg-zinc-950">
        <span className="flex items-center gap-2">
          <h2 className="text-3xl font-semibold text-cyan-400 font-lcd">
            Ollama Grid Search
          </h2>
        </span>
        <nav className="hidden md:flex gap-4">
          <ModeToggle />
          <SettingsDialog />
        </nav>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="w-[480px] border-r border-gray-200 dark:border-gray-800 gap-6 p-4 overflow-y-auto">
          <FormGridParams />
        </div>

        {/* main div */}
        <main className="flex-1 py-0 m-4 overflow-y-auto">
          <div className="text-gray-500 dark:text-gray-400">
            <GridResultsPane />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

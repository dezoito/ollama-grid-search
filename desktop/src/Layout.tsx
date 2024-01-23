import ModelSelector from "./components/filters/ModelSelector";
import { ModeToggle } from "./components/mode-toggle";

function Layout() {
  // const [name, setName] = useState("");
  // const [models, setModels] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-screen">
      {/* nav */}
      <header className="flex h-16 items-center justify-between px-4 md:px-6 bg-zinc-950">
        <span className="flex items-center gap-2">
          <h2 className="text-3xl font-semibold text-lime-600 font-lcd">
            Ollama Grid Search
          </h2>
        </span>
        <nav className="hidden md:flex gap-6">
          <ModeToggle />
        </nav>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="w-96 border-r border-gray-200 dark:border-gray-800 gap-6 p-4">
          <ModelSelector />
        </div>

        {/* main div */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="p-2 m-1">
            <p className="text-gray-500 dark:text-gray-400">
              Instructions and Experiment results
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

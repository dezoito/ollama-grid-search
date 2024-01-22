import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { Input } from "./components/ui/input";

function Layout() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  // const [models, setModels] = useState<string[]>([]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  async function get_models() {
    const models = await invoke("get_models");
    console.log("type of models", typeof models)
    return models
  }

  const query = useQuery({ queryKey: ['get_models'], queryFn: get_models })



  return (
    <div className="flex flex-col h-screen">
      {/* nav */}
      <header className="flex h-16 items-center justify-between px-4 md:px-6 bg-zinc-950">
        <span className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-teal-700 font-lcd">
            Ollama Grid Search
          </h2>
        </span>
        <nav className="hidden md:flex gap-6">
          <ModeToggle />
        </nav>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="w-96 border-r border-gray-200 dark:border-gray-800">
          <nav className="flex flex-col gap-6 p-4">


            {query.isFetched && <div className="bg-red-400">
              {(query.data as any).map((model: any) => <div>{model}</div>)}
            </div>}
          </nav>
        </div>

        {/* main div */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="container">
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                greet();
                // get_models();
              }}
            >
              <Input
                id="greet-input"
                placeholder="Enter a name..."
                onChange={(e) => setName(e.currentTarget.value)}
              />

              <Button
                variant="destructive"
                className="my-1 px-2 py-1 text-xs font-semibold leading-tight "
                type="submit"
              >
                Click me
              </Button>
            </form>
            <p>{greetMsg}</p>
            <div className="p-10 m-3">
              <p className="text-gray-500 dark:text-gray-400">
                Experiment results
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

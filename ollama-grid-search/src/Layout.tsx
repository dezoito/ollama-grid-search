import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { Input } from "./components/ui/input";

function Layout() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  // function MountainIcon(props: any) {
  //   return (
  //     <svg
  //       {...props}
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
  //     </svg>
  //   );
  // }

  return (
    <div className="flex flex-col h-screen">
      {/* nav */}
      <header className="flex h-16 items-center justify-between px-4 md:px-6 bg-slate-950">
        <span className="flex items-center gap-2">
          <div className=" text-slate-100">Add a logo here!</div>
        </span>
        <nav className="hidden md:flex gap-6">
          <ModeToggle />
        </nav>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="w-96 border-r border-gray-200 dark:border-gray-800">
          <nav className="flex flex-col gap-6 p-4">
            {/* <span className="text-sm font-medium hover:underline" href="#">
              Dashboard
            </span>
            <span className="text-sm font-medium hover:underline" href="#">
              Settings
            </span>
            <span className="text-sm font-medium hover:underline" href="#">
              Billing
            </span> */}
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
          </div>

          <div className="p-10 m-3">
            <p className="text-gray-500 dark:text-gray-400">
              Experiment results
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

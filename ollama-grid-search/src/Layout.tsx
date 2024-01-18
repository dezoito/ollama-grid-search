import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";

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
      <header className="flex h-16 items-center justify-between px-4 md:px-6 bg-slate-950">
        <span className="flex items-center gap-2" href="#">
          <div className=" text-slate-100">Add a logo here!</div>
        </span>
        <nav className="hidden md:flex gap-6">
          <ModeToggle />
        </nav>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-200 dark:border-gray-800">
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
        <main className="flex-1 p-4 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Welcome to Acme Inc</h1>

          <div className="container border-spacing-1 border-stone-900 border">
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                greet();
              }}
            >
              <input
                id="greet-input"
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="Enter a name..."
              />
              <Button
                variant="destructive"
                className="px-2 py-1 text-xs font-semibold leading-tight "
                type="submit"
              >
                Click me
              </Button>
            </form>
            <p>{greetMsg}</p>
          </div>

          <div className="p-10 m-3">
            <p className="text-gray-500 dark:text-gray-400">
              Aliquip ad do dolore fugiat enim labore. Ad consequat commodo ad
              nostrud velit occaecat sint aliquip. Laboris sunt officia duis
              cupidatat id esse adipisicing ea mollit. Ad laboris elit et dolor
              aliquip proident nisi ut commodo est esse nulla cupidatat officia.
              Magna consequat sunt consequat ut. Ullamco irure nostrud sit
              veniam aliqua laboris consectetur magna culpa cillum ipsum.
              Ullamco magna eu ad aliquip cupidatat. Est amet non qui fugiat
              minim dolore pariatur sit exercitation aliqua consequat cupidatat
              veniam. Nulla voluptate duis sit mollit aliquip fugiat consequat
              pariatur. Cupidatat deserunt occaecat laborum aliquip voluptate
              ex. Voluptate elit eiusmod ea irure incididunt laborum ad id dolor
              qui Lorem. Exercitation labore veniam amet irure occaecat
              consequat ea ea. Sit cillum est consectetur dolor. Cupidatat sunt
              reprehenderit consectetur ad excepteur officia proident eu
              deserunt. Reprehenderit sit do minim ad eiusmod est ullamco quis
              est id do consequat occaecat aliquip. Exercitation veniam ex qui
              qui in deserunt ut commodo tempor commodo fugiat occaecat sit.
              Nulla ipsum proident minim consectetur consectetur. Esse laborum
              laborum velit consequat labore pariatur proident laborum laborum.
              Velit proident veniam reprehenderit sunt ad dolor ullamco esse
              cupidatat esse dolor ullamco ullamco. Tempor velit voluptate anim
              amet deserunt culpa qui consequat cupidatat do reprehenderit. Amet
              eu et incididunt duis minim ad aliquip culpa nostrud exercitation
              ipsum occaecat. Reprehenderit in non voluptate culpa in minim
              eiusmod commodo cupidatat est est sunt commodo. Proident nulla
              adipisicing anim labore exercitation ut fugiat ut dolore ea
              ullamco labore. Occaecat non aliqua eu duis magna ullamco commodo
              elit id ut. Culpa consectetur duis pariatur occaecat magna
              excepteur minim. Irure deserunt tempor veniam cillum sint ad
              aliqua id mollit laborum nostrud ipsum. Est ullamco ipsum ut ad
              nulla culpa officia culpa magna. Cupidatat officia elit ut anim.
              Tempor proident veniam ullamco amet et aliquip culpa sit. Commodo
              ad fugiat qui do adipisicing voluptate occaecat elit do Lorem ut.
              Ullamco incididunt occaecat aliqua sunt duis occaecat in sint
              culpa ad veniam velit aliquip officia. Nostrud excepteur sint
              aliqua culpa deserunt. Do id non qui ullamco duis excepteur
              deserunt consectetur.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

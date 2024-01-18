import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container">
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
      <div></div>
    </div>
  );
}

export default App;

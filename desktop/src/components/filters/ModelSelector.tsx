import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import { CheckboxGroup } from "../checkbox-group";
import AlertError from "../ui/AlertError";

export default function ModelSelector() {
  // const [name, setName] = useState("");
  // const [models, setModels] = useState<string[]>([]);

  async function get_models() {
    const models = await invoke("get_models");
    return models;
  }

  const query = useQuery({ queryKey: ["get_models"], queryFn: get_models });

  if (query.isError) {
    return (
      <div>
        <AlertError message={JSON.stringify(query.error)} />
      </div>
    );
  }

  if (query.isLoading) {
    return <p>Loading.</p>;
  }

  return (
    <div>
      <div className="font-bold">Models:</div>
      <CheckboxGroup options={query.data as string[]} />
    </div>
  );
}

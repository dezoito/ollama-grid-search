import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import { forwardRef } from "react";
import { CheckboxGroup } from "../checkbox-group";
import AlertError from "../ui/AlertError";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface IProps {
  form: any;
}

function ModelSelector(props: IProps) {
  const { form } = props;
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
      <FormField
        control={form.control}
        name="models"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-bold">Models</FormLabel>
            <FormControl>
              {/* <Input {...field} /> */}
              <CheckboxGroup {...field} options={query.data as string[]} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default forwardRef(ModelSelector);

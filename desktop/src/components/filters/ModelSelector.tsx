import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import AlertError from "../ui/AlertError";
import { Checkbox } from "../ui/checkbox";
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

// todo: see https://ui.shadcn.com/docs/components/checkbox#form
function ModelSelector(props: IProps) {
  const { form } = props;

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
    <FormField
      control={form.control}
      name="models"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Models</FormLabel>
            {/* <FormDescription>
              Select the models you want to test.
            </FormDescription> */}
          </div>

          <Command>
            <CommandInput className="h-9" placeholder="Filter Models by Name" />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup className="overflow-y-auto max-h-32">
              {(query.data as string[]).map((option: string, idx: number) => (
                <CommandItem key={idx.toString()}>
                  <FormField
                    key={idx.toString()}
                    control={form.control}
                    name="models"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={idx.toString()}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked: boolean) => {
                                return checked
                                  ? field.onChange([...field.value, option])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== option,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {option}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                </CommandItem>
              ))}

              <FormMessage />
            </CommandGroup>
          </Command>
        </FormItem>
      )}
    />
  );
}

export default ModelSelector;

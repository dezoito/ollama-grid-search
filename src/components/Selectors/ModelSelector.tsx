import { configAtom } from "@/Atoms";
import AlertError from "@/components/ui/AlertError";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { get_models, get_ollama_version } from "../queries";
import { ScrollArea } from "../ui/scroll-area";

interface IProps {
  form: any;
}

function ModelSelector(props: IProps) {
  const { form } = props;
  const [config, __] = useAtom(configAtom);

  // Use config in query key, so we can refetch using
  // a new config when it is changed in settings
  const query = useQuery<string[]>({
    queryKey: ["get_models", config],
    queryFn: (): Promise<string[]> => get_models(config),
    refetchOnWindowFocus: "always",
    refetchInterval: 1000 * 30,
    staleTime: 0,
    // cacheTime: 0,
  });

  const versionQuery = useQuery<string>({
    queryKey: ["get_ollama_version", config],
    queryFn: (): Promise<string> => get_ollama_version(config),
    refetchInterval: 1000 * 30 * 10,
    refetchOnWindowFocus: "always",
    staleTime: 0,
    // cacheTime: 0,
  });

  // Is we change server_url, select models from new server
  // and default to the first one if any.
  useEffect(() => {
    query.data &&
      form.setValue("models", [query.data?.length && query.data[0]]);
  }, [config.server_url]);

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
            <FormLabel className="text-base">
              Models{" "}
              <span className="text-sm text-gray-500">
                ({(query.data as string[]).length} available on{" "}
                {config.server_url} - Ollama v.
                {versionQuery.data && JSON.parse(versionQuery.data).version})
              </span>
            </FormLabel>
          </div>

          <Command>
            <CommandInput className="h-9" placeholder="Filter Models by Name" />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-32">
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
                            className="flex w-full flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    field.onChange([...field.value, option]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== option,
                                      ),
                                    );
                                  }
                                  form.trigger();
                                }}
                              />
                            </FormControl>
                            <FormLabel className="w-full text-sm font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </CommandItem>
                ))}

                <FormMessage />
              </ScrollArea>
            </CommandGroup>
          </Command>
        </FormItem>
      )}
    />
  );
}

export default ModelSelector;

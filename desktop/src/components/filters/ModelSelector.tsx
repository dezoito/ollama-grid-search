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
import { UseFormReturn } from "react-hook-form";
import { get_models } from "../queries";

interface IProps {
  form: UseFormReturn<
    {
      models: [string, ...string[]];
      prompt: string;
      uuid?: string | undefined;
      temperatureList?: any;
      repeatPenaltyList?: any;
      topKList?: any;
      topPList?: any;
    },
    any,
    undefined
  >;
}

function ModelSelector(props: IProps) {
  const { form } = props;
  const [config, __] = useAtom(configAtom);

  // Use config in query key, so we can refetch using
  // a new config when it is changed in settings
  const query = useQuery({
    queryKey: ["get_models", config],
    queryFn: () => get_models(config),
    staleTime: 0,
    // cacheTime: 0,
  });

  // changing the source for the models should
  // force the form to be reset
  useEffect(() => {
    form.reset();
  }, [config]);

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
                ({(query.data as string[]).length} available)
              </span>
            </FormLabel>
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

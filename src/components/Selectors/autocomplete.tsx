import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { get_all_prompts } from "../queries";

import { IPrompt } from "@/Interfaces";

export interface IProps {
  trigger: boolean;
  index: number;
  onSelect: (value: string) => void;
}

export function Autocomplete({ trigger, index, onSelect }: IProps) {
  const [filteredPrompts, setFilteredPrompts] = React.useState<IPrompt[]>([]);

  const promptQuery = useQuery<IPrompt[]>({
    queryKey: ["get_all_prompts"],
    queryFn: (): Promise<IPrompt[]> => get_all_prompts(),
    refetchInterval: 1000 * 30 * 1,
    refetchOnWindowFocus: "always",
    staleTime: 0,
  });

  React.useEffect(() => {
    if (trigger) {
      setFilteredPrompts(promptQuery.data || []);
    } else {
      setFilteredPrompts([]);
    }
  }, [trigger, promptQuery.data]);

  if (promptQuery.isLoading) {
    return <></>;
  }

  return (
    <div className="relative" id={`autocomplete-${index}`}>
      {filteredPrompts.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-40 overflow-auto rounded border bg-white shadow">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.slug}
              className="p-2 last:cursor-pointer hover:bg-gray-100 dark:bg-gray-800"
              onClick={() => onSelect(prompt.prompt)}
            >
              <strong>{prompt.slug}</strong> - {prompt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

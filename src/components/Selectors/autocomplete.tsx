import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { get_all_prompts } from "../queries";

import { IPrompt } from "@/Interfaces";
import { ScrollArea } from "../ui/scroll-area";

export interface IProps {
  trigger: boolean;
  index: number;
  inputText?: string;
  onSelect: (value: string) => void;
}

export function Autocomplete({
  trigger,
  index,
  inputText = "",
  onSelect,
}: IProps) {
  const [filteredPrompts, setFilteredPrompts] = React.useState<IPrompt[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const optionsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const promptQuery = useQuery<IPrompt[]>({
    queryKey: ["get_all_prompts"],
    queryFn: (): Promise<IPrompt[]> => get_all_prompts(),
    refetchInterval: 1000 * 30 * 1,
    refetchOnWindowFocus: "always",
    staleTime: 0,
  });

  // Reset selected index when filtered prompts change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPrompts]);

  // Filter options based on input
  React.useEffect(() => {
    if (trigger && promptQuery.data) {
      const filterText = inputText.slice(1).toLowerCase();
      const filtered = promptQuery.data.filter((prompt) =>
        prompt.slug.toLowerCase().startsWith(filterText),
      );
      setFilteredPrompts(filtered);
    } else {
      setFilteredPrompts([]);
    }
  }, [trigger, promptQuery.data, inputText]);

  // Scroll selected option into view
  const scrollSelectedIntoView = React.useCallback((index: number) => {
    const selectedElement = optionsRef.current[index];
    if (!selectedElement) return;

    // Find the scrollable viewport within ScrollArea
    const viewport = containerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) return;

    const elementTop = selectedElement.offsetTop;
    const elementBottom = elementTop + selectedElement.offsetHeight;
    const viewportHeight = viewport.clientHeight;
    const scrollTop = viewport.scrollTop;

    // Check if element is outside the visible area
    if (elementTop < scrollTop) {
      // Scroll up to show element
      viewport.scrollTop = elementTop;
    } else if (elementBottom > scrollTop + viewportHeight) {
      // Scroll down to show element
      viewport.scrollTop = elementBottom - viewportHeight;
    }
  }, []);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!trigger || filteredPrompts.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.min(prev + 1, filteredPrompts.length - 1);
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => scrollSelectedIntoView(next));
            return next;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => scrollSelectedIntoView(next));
            return next;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredPrompts.length) {
            onSelect(filteredPrompts[selectedIndex].prompt);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    trigger,
    filteredPrompts,
    selectedIndex,
    onSelect,
    scrollSelectedIntoView,
  ]);

  if (promptQuery.isLoading) {
    return <></>;
  }

  return (
    <div className="absolute w-full" id={`autocomplete-${index}`}>
      {filteredPrompts.length > 0 && (
        <div ref={containerRef}>
          <ScrollArea className="absolute z-10 mt-1 h-32 max-h-32 w-full rounded border bg-white shadow dark:bg-black">
            {filteredPrompts.map((prompt, idx) => (
              <div
                key={prompt.slug}
                ref={(el) => (optionsRef.current[idx] = el)}
                className={`cursor-pointer p-2 ${
                  idx === selectedIndex ? "bg-accent" : ""
                }`}
                onClick={() => onSelect(prompt.prompt)}
                role="option"
                aria-selected={idx === selectedIndex}
              >
                <div className="font-bold">/{prompt.slug}</div>
                <div className="text-sm text-gray-500 dark:text-gray-200">
                  {prompt.name}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default Autocomplete;

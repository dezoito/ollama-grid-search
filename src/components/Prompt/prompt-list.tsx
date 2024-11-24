import { formValuesAtom } from "@/Atoms";
import { IPrompt } from "@/Interfaces";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useToast } from "../ui/use-toast";

interface IProps {
  prompts: IPrompt[];
  currentPrompt: IPrompt | null;
  setCurrentPrompt: (prompt: IPrompt) => void;
}

export function PromptList(props: IProps) {
  const { prompts, currentPrompt, setCurrentPrompt } = props;
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const promptRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [formValues, setFormValues] = useAtom(formValuesAtom);

  const addPromptToExperiment = (prompt: IPrompt) => {
    setFormValues({
      ...formValues,
      prompts: [...formValues.prompts, prompt.prompt],
    });

    toast({
      variant: "success",
      title: "Prompt added to experiment.",
      duration: 2000,
    });
  };

  useEffect(() => {
    if (!scrollAreaRef.current) return;

    // Find the actual scrollable viewport within the ScrollArea
    const viewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) return;

    if (!currentPrompt) {
      // Scroll to top when currentPrompt is null
      viewport.scrollTop = 0;
    } else {
      // Scroll to the selected prompt element
      const selectedElement = promptRefs.current[currentPrompt.uuid];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [currentPrompt, prompts]);

  if (prompts.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        <div>There are no prompts in the database.</div>
        <div>Please create a new prompt to get started.</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] space-y-2" ref={scrollAreaRef}>
      {prompts.map((prompt: IPrompt) => (
        <div
          key={prompt.uuid}
          ref={(el) => (promptRefs.current[prompt.uuid] = el)}
          onClick={() => setCurrentPrompt(prompt)}
          className={`mb-2 flex cursor-pointer items-center rounded p-2 hover:cursor-pointer ${
            currentPrompt && prompt.uuid === currentPrompt.uuid
              ? "bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
        >
          <div className="flex flex-col">
            <span className="flex-1">{prompt.name}</span>
            <span className="text-md text-gray-500 dark:text-gray-500">
              /{prompt.slug}
            </span>
          </div>
          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <PlusIcon
                    className="h-5 w-5"
                    onClick={() => addPromptToExperiment(prompt)}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>
                Add this prompt to experiment
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}

export default PromptList;

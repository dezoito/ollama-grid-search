import { IPrompt } from "@/Interfaces";
import { FilePlusIcon } from "@radix-ui/react-icons";
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

  const addPromptToExperiment = (prompt: IPrompt) => {
    //TODO: Implement this
    console.log("prompt to be added", prompt);
    toast({
      variant: "success",
      title: "Prompt added to experiment.",
      duration: 2000,
    });
  };

  if (prompts.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        <div>There are no prompts in the database.</div>
        <div>Please create a new prompt to get started.</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] space-y-2 ">
      {prompts.map((prompt: IPrompt) => (
        <div
          key={prompt.uuid}
          onClick={() => setCurrentPrompt(prompt)}
          className={`flex cursor-pointer items-center rounded p-1 hover:cursor-pointer ${
            currentPrompt && prompt.uuid === currentPrompt.uuid
              ? "bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
        >
          <span className="flex-1">{prompt.name}</span>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FilePlusIcon
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

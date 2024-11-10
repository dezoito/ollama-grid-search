import { IPrompt } from "@/Interfaces";

interface IProps {
  prompts: IPrompt[];
  setCurrentPrompt: (prompt: IPrompt) => void;
}

export function PromptList(props: IProps) {
  const { prompts } = props;
  return (
    <ul className="space-y-2">
      {prompts.map((prompt: IPrompt) => (
        <li key={prompt.uuid} className="flex items-center">
          <span className="flex-1">{prompt.name}</span>
          <a href="#" className="text-sm text-blue-500 hover:underline">
            Edit
          </a>
        </li>
      ))}
    </ul>
  );
}

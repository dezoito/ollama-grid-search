import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="transparentDark"
          size="icon"
          onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
        >
          {theme == "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme == "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}

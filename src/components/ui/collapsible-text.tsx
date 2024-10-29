"use client";

import { ChevronUpIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface IProps {
  text: string;
  maxChars: number;
  textClasses?: String;
}

export function CollapsibleText({ text, maxChars, textClasses }: IProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isTextLong = text.length > maxChars;
  const displayText =
    isTextLong && !isOpen ? text.substring(0, maxChars) : text;

  useEffect(() => {
    isTextLong && !isOpen ? text.substring(0, maxChars) : text;
  }, [isOpen]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="my-1 flex justify-stretch">
        <div className={`text-sm font-semibold ${textClasses}`}>
          {displayText}
        </div>

        {isTextLong && (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUpIcon className="mr-1 h-4 w-4" />
              ) : (
                <DotsHorizontalIcon className="mr-1 h-4 w-4" />
              )}
              <span className="sr-only">Toggle Expand/Collapse</span>
            </Button>
          </CollapsibleTrigger>
        )}
      </div>

      <CollapsibleContent className="space-y-2"></CollapsibleContent>
    </Collapsible>
  );
}

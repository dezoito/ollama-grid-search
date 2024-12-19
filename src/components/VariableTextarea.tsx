import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useRef, useState } from "react";
import { Autocomplete } from "./Selectors/autocomplete";

interface VariableTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
}

export function VariableTextArea({
  value,
  onChange,
  className = "",
  rows = 4,
  placeholder = "Type '/' to search prompts...",
}: VariableTextAreaProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<{
    start: number;
    end: number;
    value: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Find all variables in the text
  const findVariables = (text: string) => {
    const regex = /\[([^\]]+)\]/g;
    const variables: Array<{
      start: number;
      end: number;
      value: string;
    }> = [];

    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.push({
        start: match.index,
        end: match.index + match[0].length,
        value: match[0],
      });
    }
    return variables;
  };

  // Select the next variable after the given position
  const selectNextVariable = (afterPosition: number) => {
    const variables = findVariables(value);
    const nextVariable = variables.find((v) => v.start > afterPosition);

    if (nextVariable && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        nextVariable.start,
        nextVariable.end,
      );
      setSelectedVariable(nextVariable);
    } else {
      setSelectedVariable(null);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (selectedVariable) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const beforeSelection = value.slice(0, selectedVariable.start);
      const afterSelection = value.slice(selectedVariable.end);
      const newValue = beforeSelection + pastedText + afterSelection;

      onChange(newValue);

      // Select next variable after a short delay
      setTimeout(
        () => selectNextVariable(selectedVariable.start + pastedText.length),
        0,
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for autocomplete trigger
    const shouldShowAutocomplete = newValue.startsWith("/");
    setShowAutocomplete(shouldShowAutocomplete);
  };

  // Select first variable when content changes
  useEffect(() => {
    if (textareaRef.current) {
      selectNextVariable(-1);
    }
  }, [value]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        className={className}
        rows={rows}
        placeholder={placeholder}
      />
      <Autocomplete
        trigger={showAutocomplete}
        index={0}
        inputText={value}
        onSelect={(newValue) => {
          onChange(newValue);
          setShowAutocomplete(false);
          // Select first variable after autocomplete
          setTimeout(() => selectNextVariable(-1), 0);
        }}
      />
    </div>
  );
}

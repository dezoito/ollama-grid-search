import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrashIcon } from "@radix-ui/react-icons";
import { PromptDialog } from "@/components/prompt-dialog";
// import { Form } from "react-hook-form"
import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IProps {
  form: any;
}

function PromptSelector(props: IProps) {
  const { form } = props;
  const [prompts, setPrompts] = useState<string[]>(form.getValues().prompts)

  const setPromptForIdx = useCallback(({
    idx,
    prompt
  }: {
    idx: number,
    prompt: string
  }) => {
    const tmpPrompts = prompts.slice()
    tmpPrompts[idx] = prompt
    setPrompts(tmpPrompts)
  }, [prompts])

  const addPrompt = useCallback(() => {
    const idx = prompts.length
    const tmpPrompts = prompts.slice()
    tmpPrompts[idx] = ""
    setPrompts(tmpPrompts)
  }, [prompts])

  const removePrompt = useCallback((idx: number) => {
    const tmpPrompts = prompts.slice()
    tmpPrompts.splice(idx, 1)
    setPrompts(tmpPrompts)
  }, [prompts])

  useEffect(() => {
    // sync form state
    form.setValue("prompts", prompts)
  }, [prompts])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, idx: number) => {
    setPromptForIdx({ idx: idx, prompt: e.target.value })
  }

  return (
    <FormField
      control={form.control}
      name="prompts"
      render={() => (
        <FormItem>
          <FormLabel className="text-base flex flex-row items-center justify-between font-bold">
            Prompts
          </FormLabel>
          {prompts.map((option: string, idx: number) => (
            <FormField
              key={idx.toString()}
              control={form.control}
              name="prompt"
              render={({ field }) => {
                return (
                  <FormItem key={idx.toString()}>
                    <FormLabel className="flex flex-row items-center justify-between font-bold">
                      Prompt {prompts.length > 1 && (idx + 1).toString()}
                      <div>
                        <PromptDialog content={option} handleChange={handleChange} idx={idx} fieldName="prompt" fieldLabel="prompt"  />
                        {prompts.length > 1 && <Button
                          variant="destructiveGhost"
                          size="sm"
                          type="button"
                          disabled={prompts.length === 1}
                          onClick={() => removePrompt(idx)}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TrashIcon className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>Delete prompt</TooltipContent>
                          </Tooltip>
                        </Button>}
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="flex-1"
                        value={option}
                        rows={4}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e, idx)}
                      />
                    </FormControl>
                    <FormDescription>The prompt you want to test</FormDescription>
                  </FormItem>
                );
              }}
            />
          ))}

          <FormMessage />
          {prompts.length === 1 && <FormDescription>
            Add another prompt to test multiple prompts.
          </FormDescription>}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => addPrompt()}
          >Add Another Prompt</Button>
        </FormItem>
      )}
    />
  );
}

export default PromptSelector;

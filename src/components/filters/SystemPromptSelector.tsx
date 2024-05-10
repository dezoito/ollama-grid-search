import { PromptDialog } from "@/components/prompt-dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
// import { Form } from "react-hook-form"
import * as React from "react";

interface IProps {
  form: any;
}

function SystemPromptSelector(props: IProps) {
  const { form } = props;
  const idx = 0;
  const [systemPrompt, setSystemPrompt] = useState<string>(
    form.getValues().system_prompt,
  );

  useEffect(() => {
    // sync form state
    form.setValue("system_prompt", systemPrompt);
  }, [systemPrompt]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    _: number,
  ) => {
    setSystemPrompt(e.target.value);
  };

  return (
    <FormField
      control={form.control}
      name="system_prompt"
      render={() => (
        <FormItem>
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center justify-between font-bold">
                    System Prompt
                    <div>
                      <PromptDialog
                        content={systemPrompt}
                        handleChange={handleChange}
                        idx={idx}
                        fieldName="system_prompt"
                        fieldLabel="system prompt"
                      />
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="flex-1"
                      value={systemPrompt}
                      rows={4}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleChange(e, idx)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. The system message used to specify custom
                    behavior.
                  </FormDescription>
                </FormItem>
              );
            }}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SystemPromptSelector;

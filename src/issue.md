12-oct-2024

trying to scaffold experiment cloning.
moved default for prompts to configAtom.

the, however, is resolved as undefined, when merging into form-grid-param values, because it is not set at the settings form, therefore not copied to local storage (I assume).

This causes PromptSelector not to load, which causes the app to fail.

Possible fixes...

1. add a default prompts field to settings?

2. Using nullish coalescence to insert a default?

======
I moved prompts from config to defaultGridParams atom
in the form, I had to refer to that atom to use the value on the form.

That worked.

====
To trigger inference, we need to change the value of gridParams.experiment_uuid, but if we use the value from an older experiment, we will rewrite its log file!

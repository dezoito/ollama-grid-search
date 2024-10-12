12-oct-2024

trying to scaffold experiment cloning.
moved default for prompts to configAtom.

the, however, is resolved as undefined, when merging into form-grid-param values, because it is not set at the settings form, therefore not copied to local storage (I assume).

This causes PromptSelector not to load, which causes the app to fail.

Possible fixes...

1. add a default prompts field to settings?

2. Using nullish coalescence to insert a default?

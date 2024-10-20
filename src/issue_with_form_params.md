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
[ok] To trigger inference, we need to change the value of gridParams.experiment_uuid, but if we use the value from an older experiment, we will rewrite its log file!

[ok] we are close, but remember the form fields can hold arrays of data, so we have to retype TFormValues and make sure we can import those into the form

[ok] Try updating TParamIteration with strings, or rewriting every field (which is more correct)
[ok] If we rewrite the fields, using temperatureList, we could also manually derive them each from configAtom.

[ok] Can we derive gridParams from FormValues, adding just uuid?

[ok] There is something wrong happening when we set form values to string arrays --> Fixed by using the arrayToFormValue() function

[ok] Use only FormParams Atom (adding an experiment_uuid field), getting rid of defaultGridParams

[ok] When rebuilding the values to be inserted into the FormValues atom, we will have to loop over the prompts from the experiment to build the prompt array

[ok] Check why the experiment files seem to be keeping only one value for each param, even when an array of different values was used. --> The issue was that the formValuesAtom was always returning the default config, instead of updated values. This has been corrected in Atoms.py

[ok] All form values are updated now but, however, the prompt component is not displayed correctly.
It displays the previous prompts that were in the form before cloning, instead of the updated values.

[ok] Fix Generation per prompt calculation when cloning
! This is fixed but the current implementation has a bug: since it recalculates the # of generations based on the experiment log file, it can miscalculate
when that file is based on an interrupted experiment
(the number of total inferences will be less than expected to properly calc. generations)

    Proposed way to fix this:
    1- Start a new version for the generation log file
    2- Store the current inference params used for the experiment in this file
    3- When cloning experiments, check the version:
    - use the current way if the version is old
    - just copy those params if the log is in the new format

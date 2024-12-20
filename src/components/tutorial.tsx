export default function Tutorial() {
  return (
    <div className="flex flex-col gap-8 px-4">
      <div className="flex flex-col gap-3">
        <div className="text-2xl font-bold">Grid Search</div>
        <div>
          Grid search refers to systematically exploring different combinations
          of parameters within predefined ranges to optimize model performance.
        </div>
        <div>
          Use the form to define multiple values for the parameters you want to
          test and evaluate how these affect the responses to a given model and
          prompt.
        </div>
        <div>
          You can, for example, set "temperature" to a list of values (say,{" "}
          <code>0.1</code>, <code>0.5</code>, <code>0.9</code>) and inspect the
          difference in the results.
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-2xl font-bold">A/B Testing</div>
        <div>
          A/B testing involves comparing the performance of different models
          when making inferences on the same parameters or data.
        </div>
        <div>
          You can perform A/B testing on a prompt by selecting different models
          and keeping a single combination of params.
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-2xl font-bold">Experiment History</div>

        <div>
          You can visualize past experiments, export them in JSON format, or
          re-run them with the same parameters and configurations.
        </div>
      </div>
    </div>
  );
}

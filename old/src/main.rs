use anyhow::{anyhow, Result};
use chrono::Local;
use console::style;
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, Value};
use std::collections::HashMap;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
struct Response {
    // Define the structure of the expected response if any
    // This can be adjusted based on the actual response format
    // For simplicity, assuming a JSON response with a "result" field
    result: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Options {
    temperature: f32,
    repeat_penalty: f32,
    top_k: i8,
    top_p: f32,
}

#[derive(Serialize, Deserialize, Debug)]
struct RequestObject<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
    options: Options,
}

fn current_timestamp() -> String {
    let current_datetime = Local::now();
    return current_datetime.format("%Y-%m-%d %H:%M:%S").to_string();
}

fn nanoseconds_to_seconds(nanoseconds: u64) -> u64 {
    const NANOSECONDS_IN_SECOND: u64 = 1_000_000_000;

    nanoseconds / NANOSECONDS_IN_SECOND
}

fn nanoseconds_to_minutes_seconds(nanoseconds: u64) -> (u64, u64) {
    const NANOSECONDS_IN_MINUTE: u64 = 60_000_000_000;
    const NANOSECONDS_IN_SECOND: u64 = 1_000_000_000;

    let total_minutes = nanoseconds / NANOSECONDS_IN_MINUTE;
    let remaining_nanoseconds = nanoseconds % NANOSECONDS_IN_MINUTE;
    let seconds = remaining_nanoseconds / NANOSECONDS_IN_SECOND;

    (total_minutes, seconds)
}

fn send_request(
    url: &str,
    body: RequestObject,
    test_timeout: u64,
) -> Result<reqwest::blocking::Response> {
    let timeout = Duration::from_secs(test_timeout); // in seconds
    let client = Client::new();

    // Send the POST request with the provided body
    let response = client.post(url).json(&body).timeout(timeout).send()?;

    // Process the response
    if response.status().is_success() {
        Ok(response)
    } else {
        // Handle unsuccessful response (e.g., print status code)
        eprintln!("Request failed with status: {:?}", response.status());

        // Create a custom error using anyhow
        Err(anyhow!(
            "Request failed with status: {:?}",
            response.status()
        ))
    }
}

// displays response data but also returns a tuple with processing info
fn process_response(json_string: &str) -> (u64, u64) {
    // Deserialize the JSON string into a JSON object (serde_json::Value)
    let json_object: Value = from_str(json_string).expect("Failed to parse JSON");
    let eval_count = json_object["eval_count"].as_u64().unwrap_or(0);
    let processing_time_in_secs =
        nanoseconds_to_seconds(json_object["total_duration"].as_u64().unwrap_or(0));

    let (minutes, seconds) =
        nanoseconds_to_minutes_seconds(json_object["total_duration"].as_u64().unwrap_or(0));
    let chars_per_sec = eval_count as f64 / processing_time_in_secs as f64;

    println!("\n");
    println!("Results");
    println!("---");

    println!("Eval Count: {}", json_object["eval_count"]);

    println!("Total Duration: {minutes}m{seconds}s",);
    println!("Chars per second {:.2}", chars_per_sec);
    println!(
        "Response: \n{}",
        style(
            json_object["response"]
                .to_string()
                .replace("\\n", "\n")
                .replace("\\t", "\t")
        )
        .cyan()
        .bright(),
    );
    // // Debug the response
    // for (key, value) in json_object.as_object().unwrap() {
    //     println!(
    //         "{}: {}",
    //         key,
    //         value.to_string().replace("\\n", "\n").replace("\\t", "\t")
    //     );
    // }

    (eval_count, processing_time_in_secs)
}

fn main() {
    // Script settings
    let test_timeout: u64 = 60 * 3;
    let ollama_url: &str = "http://localhost:11434/api/generate";

    // Model options:
    // You can use any model that has been pulled into your Ollama server
    let model: &str = "dolphin2.2-mistral:latest";

    // Params docs:
    // https://github.com/jmorganca/ollama/blob/main/docs/modelfile.md
    let temperature_list: Vec<f32> = vec![0.66, 0.75, 0.9]; // range: [0:1]
    let repeat_penalty_list: Vec<f32> = vec![1.4, 1.5, 1.75, 2.0]; // range: [0:2] IMPORTANT: using a low value (.33) made the response hang
    let top_k_list: Vec<i8> = vec![75, 85]; // range: [0:100]
    let top_p_list: Vec<f32> = vec![0.72, 0.75, 0.8]; // range: [0:1]

    // Use the values below to debug without iterations.

    // let model: &str = "dolphin2.2-mistral:latest";
    // let temperature_list: Vec<f32> = vec![0.4];
    // let repeat_penalty_list: Vec<f32> = vec![1.75];
    // let top_k_list: Vec<i8> = vec![25];
    // let top_p_list: Vec<f32> = vec![0.25];

    let combinations =
        temperature_list.len() * repeat_penalty_list.len() * top_k_list.len() * top_p_list.len();

    let prompt = r#"You are an experienced information analyst.
1- Create a brief summary of one hundred words of the text delimited by ```.
2- Be concise, and describe only the subject matter.


```
Richard Feynman: The Quantum Jester

Richard Phillips Feynman, born on May 11, 1918, in Queens, New York, was a luminary physicist who left an indelible mark on the world of science. From an early age, Feynman exhibited an insatiable curiosity and a love for tinkering with radios and machines. His intellectual journey began at the Massachusetts Institute of Technology (MIT), where he demonstrated exceptional prowess in mathematics and physics. After obtaining his Ph.D. at Princeton, he joined the Manhattan Project during World War II, showcasing his problem-solving genius.

Post-war, Feynman's brilliance came to the forefront as he revolutionized quantum electrodynamics (QED) through the introduction of Feynman diagrams. These graphical representations simplified complex calculations and provided new insights into particle interactions. His groundbreaking work earned him the Nobel Prize in Physics in 1965. Beyond his research, Feynman became a charismatic and unconventional teacher at the California Institute of Technology (Caltech). His lectures, compiled in "The Feynman Lectures on Physics," became legendary for their clarity, humor, and ability to demystify complex concepts.

Feynman's legacy extends beyond the academic realm. Known for his playful approach to life, he had a passion for bongo playing, art, and safe-cracking. His autobiographical works, including "Surely You're Joking, Mr. Feynman!" and "What Do You Care What Other People Think?" reveal the man behind the scientific mind – a curious adventurer with an irreverent sense of humor. Feynman's death on February 15, 1988, marked the end of an era, but his impact persists in the hearts and minds of scientists, students, and enthusiasts worldwide, ensuring that the spirit of the "quantum jester" lives on.

```"#;

    println!("---------------------------------------------------------------------");
    println!("Experiment started at: {}", current_timestamp());
    println!("Model: {}", model);
    println!("Total parameter combinations: {}", combinations);
    println!("Timeout (per test, in seconds): {}", test_timeout);
    println!("Prompt length (in chars): {}", style(prompt.len()).green());
    println!("Prompt: {}", style(prompt).green());
    println!("---------------------------------------------------------------------");

    // iterate over params and build request objects
    let mut total_eval_count = 0;
    let mut total_processing_time = 0;
    let mut iter = 0;
    for temperature in &temperature_list {
        for repeat_penalty in &repeat_penalty_list {
            for top_k in &top_k_list {
                for top_p in &top_p_list {
                    let request_object = RequestObject {
                        model,
                        prompt,
                        stream: false,
                        options: Options {
                            temperature: *temperature,
                            repeat_penalty: *repeat_penalty,
                            top_k: *top_k,
                            top_p: *top_p,
                        },
                    };
                    // println!("Request object {:#?}", request_object);
                    iter += 1;

                    println!("\n{} - Test started at {}:", iter, current_timestamp());
                    println!("Temperature: {}", style(temperature).cyan());
                    println!("Repeat Penalty: {}", style(repeat_penalty).cyan());
                    println!("Top_K: {}", style(top_k).cyan());
                    println!("Top_P: {}", style(top_p).cyan());

                    // Send request to Ollama server
                    let res = send_request(ollama_url, request_object, test_timeout);

                    match res {
                        Err(e) => eprint!("{:?}", style(e).red()),
                        Ok(res) => {
                            let (eval_count, processing_time_in_secs) =
                                process_response(res.text().unwrap().as_str());
                            total_eval_count += eval_count;
                            total_processing_time += processing_time_in_secs;
                        }
                    }
                    println!("\n---------------------------------------------------------");
                }
            }
        }
    }
    let (minutes, seconds) = nanoseconds_to_minutes_seconds(total_processing_time * 1_000_000_000);
    let avg_chars_per_sec = total_eval_count as f64 / total_processing_time as f64;
    println!("\n");
    println!("----------------------------------------------------------");
    println!("End of experiment at {}", current_timestamp());
    println!("AVG chars per sec {:.2}", avg_chars_per_sec);
    println!("Total Processing time {}m{}s", minutes, seconds);

    println!("----------------------------------------------------------");
}

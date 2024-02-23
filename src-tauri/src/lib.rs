use url::{ParseError, Url};

use tokio::time::{sleep, Duration};

#[allow(unused)]
pub async fn wait_and_return(duration_seconds: u64) -> String {
    // Convert seconds to Duration
    let duration = Duration::from_secs(duration_seconds);

    // Sleep for the specified duration
    sleep(duration).await;

    // Return a message indicating that the wait is over
    format!("Waited for {} seconds.", duration_seconds)
}

pub fn split_host_port(url: &str) -> Result<(String, u16), ParseError> {
    let some_url = Url::parse(url)?;
    Ok((
        format!(
            "{}://{}",
            some_url.scheme(),
            some_url.host_str().unwrap().to_string(),
        ),
        some_url.port().unwrap(),
    ))
}

# DEV

run `yarn tauri dev` to start app in dev environment

Note: `bun tauri dev` works on linux, but not on Macs right now.s

fixes webkit bs in some linux instalations
export WEBKIT_DISABLE_COMPOSITING_MODE=1

For Linux Mint 22 and Ubuntu 24, see this issue
https://github.com/tauri-apps/tauri/issues/9662

---

Workaround

I worked around this by adding the following line to /etc/apt/sources.list:

deb http://gb.archive.ubuntu.com/ubuntu jammy main

Then doing:

sudo apt update
sudo apt install libwebkit2gtk-4.0-dev

---

# NO_PROXY:

Make sure you have a `NO_PROXY` env var set to `localhost,127.0.0.1`

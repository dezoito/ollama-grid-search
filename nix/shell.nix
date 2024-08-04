{
  pkgs ? import <nixpkgs> { },
}:
let
  inherit (pkgs) lib;
in
pkgs.mkShell rec {
  CARGO_PROFILE_RELEASE_DEBUG = true;
  LD_LIBRARY_PATH = lib.makeLibraryPath nativeBuildInputs;
  RUST_BACKTRACE = "full";

  nativeBuildInputs = with pkgs; [
    bun
    cargo
    gcc
    yarn
    nixfmt-rfc-style
    pkg-config
    rustc
    webkitgtk
  ];
}

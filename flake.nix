{
  description = "A multi-platform desktop application to evaluate and compare LLM models, written in Rust and React.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachSystem
      [
        "aarch64-linux"
        "x86_64-linux"
      ]
      (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          devShells.default = import ./nix/shell.nix { inherit pkgs; };
        }
      );
}

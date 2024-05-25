{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = with pkgs; [
    # your packages here (e.g: npm)
    nodePackages_latest.pnpm
    nodejs

    gh
  ];
}

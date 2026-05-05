{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  packages = with pkgs; [
    # your packages here (e.g: npm)
    pnpm
    nodejs

    gh
  ];
}

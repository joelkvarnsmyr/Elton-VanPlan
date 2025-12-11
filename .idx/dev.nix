{ pkgs, ... }: {
  channel = "stable-24.05"; # Använder en stabil Nix-kanal
  packages = [
    pkgs.nodejs_20
    pkgs.python3      # Bra att ha för vissa script/verktyg
    pkgs.jdk17        # KRÄVS för Firebase Emulators (Firestore, Auth, etc.)
    pkgs.firebase-tools # Så att 'firebase'-kommandot alltid finns
  ];
  env = {
    # Här kan vi sätta globala miljövariabler om vi vill, 
    # t.ex. FIRESTORE_EMULATOR_HOST om vi kör lokalt.
  };
  idx = {
    # VS Code-tillägg som installeras automatiskt
    extensions = [
      "bradlc.vscode-tailwindcss" # Autocomplete för Tailwind (Grymt viktigt!)
      "esbenp.prettier-vscode"    # Formatterar koden snyggt
      "dbaeumer.vscode-eslint"    # Hittar fel i koden
      "ms-playwright.playwright"  # Kör tester direkt i UI:t
    ];
    workspace = {
      # Körs när workspace startar
      onStart = {
        install-dependencies = "npm install";
        # Vi kan lägga till 'install-browsers' för playwright om vi vill att tester ska funka direkt:
        install-playwright-browsers = "npx playwright install --with-deps"; 
      };
      # Körs bara första gången workspace skapas
      onCreate = {
        install-dependencies = "npm install";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          # Vite-kommandot för preview
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}

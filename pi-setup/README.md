# JohnBox Raspberry Pi Setup Guide

This guide explains how to deploy the JohnBox media center to a Raspberry Pi and control it using your TV's remote (via HDMI-CEC / Anynet+).

## Prerequisites

1.  A Raspberry Pi (Raspberry Pi 4 or 5 recommended for smooth video playback).
2.  Raspberry Pi OS (Bookworm or Bullseye) installed and running.
3.  The Raspberry Pi connected to your TV via HDMI.
4.  **Crucial:** Ensure HDMI-CEC (Samsung calls it Anynet+, LG calls it SimpLink, Sony calls it Bravia Sync) is enabled in your TV's settings.

## Automated Installation

The easiest way to set everything up is to use the provided installation script.

1.  **Transfer the project** to your Raspberry Pi (e.g., via Git clone or SCP).
2.  **Open a terminal** on your Raspberry Pi and navigate to the project's root directory.
3.  **Run the installation script:**

    ```bash
    chmod +x pi-setup/install.sh
    ./pi-setup/install.sh
    ```

### What the script does:

*   **Installs Dependencies:** Installs required packages like `python3-evdev` (for keyboard emulation), `cec-utils` (for reading TV remote signals), `nginx` (web server), and `unclutter` (to hide the mouse cursor).
*   **Builds the App:** Runs `npm install` and `npm run build` to compile the React application.
*   **Configures Nginx:** Copies the built application to `/var/www/html/` so it's served locally on port 80.
*   **Sets up the CEC Bridge:** Creates a systemd service (`johnbox-cec.service`) that runs `pi-setup/cec_keyboard.py` in the background. This script listens for your TV remote presses and translates them into keyboard presses that the React app understands.
*   **Configures Kiosk Mode:** Modifies the Raspberry Pi's autostart configuration so that Chromium automatically launches in full-screen (kiosk) mode, pointing to `http://localhost`, hiding the desktop environment.

## Manual Steps (If the script fails)

If you prefer to do it manually or encounter issues:

1.  **Install CEC and Evdev:**
    ```bash
    sudo apt-get update
    sudo apt-get install cec-utils python3-evdev unclutter
    ```

2.  **Build the App:**
    ```bash
    npm install
    npm run build
    ```

3.  **Serve the App:** You can use Nginx (as the script does) or a simple HTTP server.
    ```bash
    # Using a simple python server for testing (run inside the 'dist' folder)
    cd dist
    python3 -m http.server 80
    ```

4.  **Run the CEC Bridge:**
    ```bash
    # Run this in a separate terminal or set it up as a service
    sudo python3 pi-setup/cec_keyboard.py
    ```

## Troubleshooting

*   **Remote Not Working:**
    *   Ensure Anynet+ (or your TV's equivalent) is enabled in the TV settings.
    *   Try running `cec-client` in the terminal to see if it detects your TV and registers key presses.
    *   Ensure the `johnbox-cec.service` is running: `sudo systemctl status johnbox-cec.service`.
*   **Mouse Cursor Visible:** Ensure `unclutter` is installed and running.
*   **App Not Loading on Boot:** Check the `~/.config/lxsession/LXDE-pi/autostart` file to ensure the Chromium command is correct.

## Key Mappings

The `cec_keyboard.py` script maps the following TV remote buttons to the app:

*   **Arrows (Up/Down/Left/Right):** Navigation
*   **Select / OK:** Enter (Select item, Play)
*   **Back / Return / Exit:** Escape / Backspace (Go back, Close player, Close modal)
*   **Play / Pause / Stop / Rewind / Fast Forward:** Mapped to standard media keys (P, Space, Esc, R, F) - *Note: Support for these depends on the specific web player used.*

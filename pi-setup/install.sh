#!/bin/bash

# Exit on error
set -e

echo "==============================================="
echo "  JohnBox Media Center - Raspberry Pi Setup"
echo "==============================================="
echo ""

# 1. Update system and install dependencies
echo "[1/6] Updating system and installing dependencies..."
sudo apt-get update
sudo apt-get install -y \
    python3-evdev \
    cec-utils \
    nginx \
    git \
    curl \
    unclutter \
    chromium-browser

# 2. Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    echo "[2/6] Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "[2/6] Node.js is already installed."
fi

# 3. Build the React App
echo "[3/6] Building the React application..."
# Assuming this script is run from the project root
npm install
npm run build

# 4. Configure Nginx to serve the app
echo "[4/6] Configuring Nginx..."
sudo cp -r dist/* /var/www/html/
# Ensure correct permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo systemctl restart nginx

# 5. Set up the CEC to Keyboard Bridge Service
echo "[5/6] Setting up HDMI-CEC bridge service..."
# Make the python script executable
chmod +x pi-setup/cec_keyboard.py

# Create a systemd service file
cat << EOF | sudo tee /etc/systemd/system/johnbox-cec.service
[Unit]
Description=JohnBox HDMI-CEC to Keyboard Bridge
After=network.target

[Service]
ExecStart=/usr/bin/python3 $(pwd)/pi-setup/cec_keyboard.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable johnbox-cec.service
sudo systemctl restart johnbox-cec.service

# 6. Configure Kiosk Mode (Autostart Chromium on boot)
echo "[6/6] Configuring Kiosk Mode..."
# Create autostart directory if it doesn't exist
mkdir -p ~/.config/lxsession/LXDE-pi/

# Create or overwrite the autostart file
cat << EOF > ~/.config/lxsession/LXDE-pi/autostart
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@unclutter -idle 0.1 -root
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --kiosk --disable-restore-session-state --disable-infobars http://localhost
EOF

echo ""
echo "==============================================="
echo "  Setup Complete!"
echo "==============================================="
echo "Your Raspberry Pi is now configured to run JohnBox."
echo "The app is being served by Nginx on port 80."
echo "The HDMI-CEC bridge is running in the background."
echo "Chromium will automatically launch in full-screen kiosk mode on the next boot."
echo ""
echo "Please reboot your Raspberry Pi to apply all changes:"
echo "  sudo reboot"

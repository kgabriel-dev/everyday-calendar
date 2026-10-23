#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
USER_HOME="$HOME"

# copy .xinitrc to the home directory
cp "$SCRIPT_DIR/.xinitrc" "$USER_HOME/.xinitrc"
chmod +x "$USER_HOME/.xinitrc"

# install dependencies via apt
sudo apt update
sudo apt install -y python3 python3-venv xserver-xorg xinit xterm x11-xserver-utils x11-utils chromium curl unclutter

# create the virtual environment for the backend and install dependencies
python3 -m venv "$PROJECT_DIR/backend/.venv"
source "$PROJECT_DIR/backend/.venv/bin/activate"
pip install -r "$PROJECT_DIR/backend/requirements.txt"
deactivate

# create the systemd service file
sed "s/@USER@/$USER/g" "$SCRIPT_DIR/everyday-calendar.service" | sudo tee /etc/systemd/system/everyday-calendar.service > /dev/null
sudo systemctl daemon-reload
sudo systemctl enable everyday-calendar.service

# NOTE: the following commands need to be run at last because "newgrp tty" opens a new shell
# add current user to the 'tty' group to allow access to the TTY (dev/tty2 is required for X server later)
sudo usermod -aG tty $USER
#!/bin/bash

# copy .xinitrc to the home directory
cp everyday-calendar/scripts/.xinitrc .xinitrc
chmod +x .xinitrc

# install dependencies via apt
sudo apt update
sudo apt install -y python3 xserver-xorg xinit xterm x11-xserver-utils x11-utils chromium unclutter

# create the virtual environment for the backend and install dependencies
python3 -m venv everyday-calendar/backend/.venv
source everyday-calendar/backend/.venv/bin/activate
pip install -r everyday-calendar/backend/requirements.txt
deactivate

# create the systemd service file
sed -i 's/USER/'"$USER"'/g' everyday-calendar/scripts/everyday-calendar.service
mkdir -p ~/.config/systemd/user
cp everyday-calendar/scripts/everyday-calendar.service ~/.config/systemd/user/everyday-calendar.service
systemctl --user enable everyday-calendar.service

# NOTE: the following commands need to be run at last because "newgrp tty" opens a new shell
# add current user to the 'tty' group to allow access to the TTY (dev/tty2 is required for X server later)
sudo usermod -aG tty $USER
# reload the group memberships in order to apply the changes immediately
newgrp tty
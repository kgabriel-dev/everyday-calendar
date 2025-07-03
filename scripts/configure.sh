#!/bin/bash

# copy .xinitrc to the home directory
mv .xinitrc ~/.xinitrc

# install dependencies via apt
sudo apt update
sudo apt isntall -y python3 xserver-xorg xinit xterm x11-xserver-utils x11-utils chromium-browser

# add current user to the 'tty' group to allow access to the TTY (dev/tty2 is required for X server later)
sudo usermod -aG tty $USER

# create the virtual environment for the backend and install dependencies
python3 -m venv everyday-calendar/backend/.venv
source everyday-calendar/backend/.venv/bin/activate
pip install -r everyday-calendar/backend/requirements.txt
deactivate
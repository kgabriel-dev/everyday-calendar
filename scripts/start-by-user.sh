#!/bin/bash

# Get the current user's home directory
USER_HOME="$HOME"

export DISPLAY=:0
export XAUTHORITY="$USER_HOME/.Xauthority"

sudo chmod 660 /dev/tty2

xinit -- :0 vt2

# from here the ~/.xinitrc script is executed, which executes started-by-x.sh
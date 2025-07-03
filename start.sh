#!/bin/sh

# Get the current user's home directory
USER_HOME="$HOME"

export DISPLAY=:0
export XAUTHORITY="$USER_HOME/.Xauthority"

sudo chmod 660 /dev/tty2

# Start X server for Chromium only without a desktop environment
xinit "$USER_HOME/everyday-calendar/start-x-session.sh" -- :0 vt2

# set screen resolution and orientation
xrandr --output HDMI-1 --rotate left --size 1920x1080

# toggle of the screensaver
xset s off
xset -dpms
xset s noblank

# start the UI server
cd "$USER_HOME/everyday-calendar/calendar"
python3 -m http.server 5500 &
# save the process ID of the frontend server in order to kill it later
FRONT_PID=$!
echo "Started frontend with PID $FRONT_PID"

# start the backend server
. "$USER_HOME/everyday-calendar/backend/.venv/bin/activate"
python3 "$USER_HOME/everyday-calendar/backend/app.py" &
deactivate
# save the process ID of the backend server in order to kill it later
BACK_PID=$!
echo "Started backend with PID $BACK_PID"

# hide the mouse cursor using unclutter
unclutter &

# start Chromium
exec chromium-browser --no-memcheck --disable-features=Translate --disable-gpu --start-fullscreen --kiosk --noerrdialogs --disable-infobars --window-size=1080,1920 http://localhost:5500/display.html

# if we reach this point, it means Chromium has exited

# kill the frontend and backend servers
echo "Killing frontend with PID $FRONT_PID"
kill $FRONT_PID
echo "Killing backend with PID $BACK_PID"
kill $BACK_PID

echo "Exiting..."
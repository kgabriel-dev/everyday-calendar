#!/bin/bash

# start the UI server
cd "$HOME/everyday-calendar/calendar"
python3 -m http.server 5500 > /dev/null 2>&1 &
# save the process ID of the frontend server in order to kill it later
FRONT_PID=$!

# start the backend server
source "$HOME/everyday-calendar/backend/.venv/bin/activate"
python3 "$HOME/everyday-calendar/backend/app.py" > /dev/null 2>&1 &
deactivate
# save the process ID of the backend server in order to kill it later
BACK_PID=$!

# hide the mouse cursor using unclutter
unclutter > /dev/null 2>&1 &

# start Chromium
exec chromium-browser --no-memcheck --disable-features=Translate --disable-gpu --start-fullscreen --kiosk --noerrdialogs --disable-infobars --window-size=1080,1920 http://localhost:5500/display.html > /dev/null 2>&1

# if we reach this point, it means Chromium has exited

# kill the frontend and backend servers
echo "Killing frontend with PID $FRONT_PID"
kill $FRONT_PID
echo "Killing backend with PID $BACK_PID"
kill $BACK_PID

# set screen resolution and orientation
xrandr --output HDMI-1 --rotate left --size 1920x1080 > /dev/null 2>&1

# toggle of the screensaver
xset s off > /dev/null 2>&1
xset -dpms > /dev/null 2>&1
xset s noblank > /dev/null 2>&1

bash "$HOME/everyday-calendar/scripts/start-by-x.sh"
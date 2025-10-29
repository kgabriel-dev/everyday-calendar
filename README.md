# The digital Everyday Calendar

This project is a homage to <a href="https://www.youtube.com/@simonegiertz">Simone Giertz</a>'s <a href="https://yetch.studio/products/every-day-goal-calendar">Everyday Calendar</a>. <br />

Personally, I really like the idea of her product. However, it is also a quite expansive. 
That is why I created this software.

## About the Everyday Calendar

The **Everyday Calendar** is a digital version inspired by [Simone Giertz’s original physical Everyday Calendar](https://yetch.studio/products/every-day-goal-calendar).
Her project visualized habits in a simple, beautiful way by letting you press a button each day you complete your goal, lighting up that day on the calendar.

This project reimagines that concept using a **Raspberry Pi Zero 2 W** and a **display**.
Instead of physical buttons, the digital interface allows you to track your daily progress, visualize streaks, and customize the look and behavior of the calendar.

The goal is to **make habit tracking more personal, visual, and self-hosted** — no apps, no cloud, just a standalone display that runs entirely on your Raspberry Pi.

---

### Features

* Simple setup
* Lets you track as many habits as you want
* Automatically launches on boot
* Local data storage, so no internet connection required

---

### Credits

Original concept by **Simone Giertz**; Digital implementation by **me (kgabriel-dev)**

## Usage
After you have completed the installation steps below, the Everyday Calendar will start automatically on boot. The Raspberry Pi runs a simple web server that serves a control panel.

To interact with the calendar, you need it's IP address.

The control panel can be accessed by navigating to `http://<RASPBERRY_PI_IP_ADDRESS>:5500/calendar.html` in your web browser.

The website is the interface of the calendar, so you can use it to mark your habits as done for the day. You do this by clicking on the respective day in the calendar view.

In the bottom right corner of the calendar, there is a settings button. Clicking it opens the settings panel, where you can:
* Add or remove habits
* Select the habit to display on the calendar
* Reset your progress on specific habits

## Installation

This guide describes how to set up the **Everyday Calendar** project on a **Raspberry Pi Zero 2 W** using **Raspberry Pi OS Lite (64-bit)**.

### 1. Install Raspberry Pi OS

1. Open the **Raspberry Pi Imager**.
2. Select **Raspberry Pi Zero 2 W** as your device.
3. Choose the operating system:

   ```
   Raspberry Pi OS (other) > Raspberry Pi OS Lite (64-bit)
   ```
4. Flash the image to a microSD card and boot your Raspberry Pi.

---

### 2. Prepare the system

After the first boot, update the system and install Git:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
```

---

### 3. Clone the Everyday Calendar repository

```bash
git clone https://github.com/kgabriel-dev/everyday-calendar.git
cd everyday-calendar
```

---

### 4. Run the configuration script

```bash
./scripts/configure.sh
```

This script sets up all required dependencies and configurations.

---

### 5. Allow X server to start automatically

To ensure the calendar can launch correctly at startup, allow the X server to be started by any user:

```bash
sudo nano /etc/X11/Xwrapper.config
```

Change the line:

```
allowed_users=console
```

to:

```
allowed_users=anybody
```

Save the file (**Ctrl + O**, then **Enter**) and exit (**Ctrl + X**).

---

### 6. Enable auto-login

To boot directly into the session without manual login:

```bash
sudo raspi-config
```

1. Select **System**.
2. Choose **Auto-Login**.
3. Confirm with **Yes**.

---

### 7. Reboot

```bash
sudo reboot
```

After rebooting, the Everyday Calendar should start automatically.
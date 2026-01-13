---
layout: post
title:  Building an Autonomous Indoor Drone for 3D Mapping
categories: [Drones]
tags: ROS2 SLAM
---

## Introduction
While working at Brightpick, I got the chance to become a doctoral student at the Technical University of Košice. Our remote office was right on the university campus, and when my colleague—who was also teaching there—asked if I'd be interested in doing a PhD, I didn't think twice. I knew there wouldn't be a better opportunity than this, so I went for it. This project became the heart of my dissertation.

This blog post summarizes my dissertation thesis in a concise way, covering my goals, the process, and the results. If by any chance someone wants to read the full paper, you can find it here: [Autonomous Control of UAV in GPS Denied Environment](https://elanius.github.io/assets/disertation-thesis-alexovic.pdf).

## The Problem Statement
Flying drones outdoors is pretty straightforward — GPS gives you global position, and you can plan paths easily. But indoors? No GPS signal at all. That's what we call a GPS-denied environment: enclosed spaces like rooms, corridors, buildings, warehouses, or even disaster zones where satellite signals don't penetrate.
The challenges pile up fast. You can't rely on any external reference for position — everything has to come from onboard sensors. Walls and furniture create tight spaces with high collision risk. Drone propellers cause turbulence and vibrations that mess with sensor accuracy. Depth cameras struggle in dark, reflective, or textureless areas (think plain white walls). And you need real-time localization + mapping (SLAM) to know where you are while building a 3D model of the unknown space. One small drift or error, and you're flying blind — or into a wall.
This is why indoor autonomous drones are still tricky, but super useful for things like inspection, search & rescue, or inventory scanning.

## The Big Goals
The project had a clear progression in three stages:

- First, prove we could create a decent 3D map with a manually controlled setup.
- Then, get the drone to navigate autonomously inside a known map.
- Finally, make it fully autonomous — explore and map completely unknown indoor environments on its own.

All of this using affordable hardware, depth cameras for sensing, and open-source tools. The end goal? Show how drones could handle real indoor jobs like building inspections after disasters, warehouse scanning, or monitoring tight spaces where GPS is useless.

## The Handheld Scanner
Before risking the drone, I built a handheld 3D scanner as a proof-of-concept. This let me validate the sensors and mapping software without any chance of crashing hardware. The key idea: use mostly the same components that would later go into the drone — the RealSense cameras, Raspberry Pi as mission computer, battery, power monitoring, etc. — so that tuning, debugging, and lessons learned carried straight over. In the end, the majority of these parts were reused on the flying platform, though a couple (like the specific battery capacity) didn't make the cut.
I took a plain plastic box as the enclosure — nothing fancy, just sturdy enough to hold everything. I mounted the two Intel RealSense cameras from the side, with all the electronics tucked safely inside to protect them during handheld use.

![Intel RealSense D435i](/assets/img/thesis/D435i.jpg){: w="350" h="200" }
*[**Intel RealSense D435i**:
RGB-D depth camera with active IR stereo;
Depth FOV: 87° × 58°;
Resolution: up to 1280 × 720 @ 90 fps;
Built-in IMU for motion data;
Global shutter on depth/IR sensors]*

![Intel RealSense T265](/assets/img/thesis/T256.jpg){: w="350" h="200" }
*[**Intel RealSense T265**:
Standalone visual-inertial odometry (VIO) tracking camera;
Dual fisheye lenses, 163° FOV;
Onboard Intel Movidius Myriad 2 VPU;
Odometry output up to 200 Hz;
Built-in IMU]*

The brain was a Raspberry Pi 4 Model B (8GB) — overclocked to 2GHz with a passive heatsink to keep it from throttling during real-time processing. Power came from a 3S LiPo 5000mAh battery (stepped down to 5V via UBEC), which gave me hours of runtime — far more than the drone would get. I wired in an Adafruit INA260 for voltage/current monitoring over I²C, so I could log data and get warnings on low battery.
Connections were straightforward: D435i on USB 2.0, T265 on USB 3.0 for bandwidth. Wi-Fi handled streaming to my laptop for live RViz visualization. RTAB-Map in ROS2 fused the depth data with T265's reliable pose estimates.

![Final handheld setup](/assets/img/thesis/3D-scanner.jpg){: w="700" h="400" }
*[Handheld scanner with cameras, Raspberry Pi and battery]*

I just walked around rooms holding the box like a portable scanner. Point clouds built up nicely in real time, tracking held steady even in bland areas, and loop closure did its job. This phase was a huge win: it proved the sensor fusion worked, gave me solid confidence, and meant most of the hardware/software stack was already battle-tested when I moved to the drone. The reuse saved a ton of rework.

## Hardware – What I Actually Flew
The drone I built is a quadrotor — bigger than a typical micro aerial vehicle (MAV), so I just call it a "drone." Why quadrotor? It can take off vertically, hover steadily, and fly slowly — all must-haves for indoor work where you need precise control in tight spaces.
I didn't want an off-the-shelf drone; instead, I assembled one from readily available components that met my specs for affordability, reliability, and easy upgrades. Here's the breakdown of the main parts.

### Frame
Holybro X500 V2 carbon fiber frame — lightweight, sturdy, and easy to carry. X-shaped design for stability and good payload capacity. Diagonal wheelbase: 500 mm, supports up to 15-inch propellers. Plenty of space for mounting the flight controller, motors, battery, and the included camera mount (which held the RealSense D435i and T265). Carbon fiber kept the weight down while handling the occasional bump better than plastic.

Honestly, it's a bit too big for really tight indoor spaces — corridors or small rooms might feel cramped with that 500 mm span, and maneuverability suffers. But that's the trade-off: the size offered a ton of room for experimenting with components, like adding extra sensors, tweaking wiring, or mounting custom parts without everything feeling jammed in. Perfect for a PhD project where I was prototyping and iterating a lot.
[Image: Holybro X500 V2 frame]

### Battery
4S LiPo, 4500 mAh capacity — chosen because the motors needed 4S voltage (up from a 3S I already had). Nominal 14.8 V (3.7 V per cell), safe discharge down to ~12 V (3.0 V/cell) to avoid damage, max charge 16.8 V (4.2 V/cell). Good balance: 15–20 minutes flight time depending on payload. I monitored closely to prevent over-discharge risks.
[Image: 4S LiPo battery]

### Power Distribution
Holybro PM03D Power Module — measures voltage/current in real time (for low-battery warnings), steps down to 5 V for electronics, and distributes battery voltage to ESCs. Critical for safe operation and not killing the battery prematurely.

### Motors and ESCs
Four AIR 2216 KV920 BLDC motors — efficient, low-resistance for strong thrust. Paired with BLHeli_S 20A ESCs (compact, fast response, motor braking features). Calibrated them to the transmitter for smooth control and to avoid damage.


## Software – The Brain Behind It
ROS2 on Ubuntu Mate 20.04 was the foundation — better real-time support and DDS comms than ROS1.
Simulation in Gazebo saved tons of time: full URDF model, TF tree, point cloud transforms, RViz viz — I tested everything virtually first.
Core stack:

- RTAB-Map: RGB-D SLAM for 3D point clouds, loop closure, using T265 odometry as input. Parameters tuned for indoor use (motion tracking mode, lower frequency to save CPU).
- Nav2: 2D costmap navigation (projected from point cloud at certain height), A*/Dijkstra global planner, DWA local planner for obstacle avoidance.
- explore_lite: Frontier-based exploration — detected unknown boundaries in the costmap and sent goals to Nav2.
- micro-ROS (with Micro XRCE-DDS over UDP): Bridged ROS2 topics to Pixhawk uORB for offboard velocity commands (50Hz setpoints).
- GStreamer + RTSP: Low-latency video (<300ms) from D435i RGB/depth — hardware-accelerated on Pi.
- Custom PID: For pose stabilization using T265 error feedback (velocity corrections to fight turbulence).
- TF tree magic: Static/dynamic transforms to align all frames (depth to base_link, etc.).

Challenges: CPU heat from overclocking, Wi-Fi bandwidth limiting real-time point cloud viz (dropped to 0.5Hz during flights), 2D costmaps in 3D world sometimes causing odd paths.

## Test Flights
Tests happened indoors on a single floor — rooms and corridors with Wi-Fi coverage.
Started manual: Arm via QGroundControl, lift to ~1m height with RC transmitter, fly slowly to build initial map and check localization. Safety always first — propeller cages, RC override ready, battery monitoring script to auto-land below 11.1V.
Then autonomous: Call ROS2 services to switch to offboard mode, trigger "/drone/start_exploration". The drone used frontiers to plan paths, explored new areas, avoided obstacles via Nav2, streamed video to ground station. After covering reachable space, it returned to start and landed.
I monitored via QGroundControl (telemetry + video), SSH for ROS commands. Post-flight, downloaded RTAB-Map database for full point cloud review. Multiple flights — some short for tuning, others full exploration demos showing coherent maps and elevation details.

## Conclusion
This PhD project was a real grind — hardware headaches, software debugging, short flight times, and plenty of "why isn't this working" moments. But it worked: the drone autonomously explored unknown indoor spaces, built usable 3D maps with RTAB-Map, navigated safely, and streamed video — all without GPS.
Key lessons? Start with handheld validation, lean hard on simulation, embrace open-source (ROS2 ecosystem is amazing), and always have a manual override. Limitations like 2D nav hacks and battery life are solvable with more work.
Next? True 3D planning, lighter builds for longer flights, maybe multi-drone stuff tying into my fleet simulation experiments. Seeing it fly and map on its own made every late night worth it.
If you're tinkering with drones or SLAM, try the ideas here — and check the full thesis if you want the equations. Drop a comment if you build something similar! 🚁
Let me know if you want tweaks: more/less detail in any section, add figures/screenshots references, change wording, or adjust length!

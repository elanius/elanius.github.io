---
layout: post
title:  -ORG- GAOF Weather Service – Dynamic Weather Geofencing for Drones
project_link: https://github.com/elanius/GAOF-weather-service
categories: [Drones]
tags: Python FastAPI React TypeScript Mongo
---

_A short-lived but fully functional full-stack service that should made drones automatically avoid bad weather_

## Volunteering
Currently I am working for AT&T and to be honest this kind of job doesn't belong to a category of dream jobs. However, this blog post is not about my complains to corporate environments but about opportunity which suddenly arisen from nowhere.
A lot of corporate emails arrive into my inbox and usually I just quickly check it if is somehow related to my and if not then it goes to oblivion. Bun once I found an email from The Opportunity Marketplace a service where colleagues can share their development needs or share offers to work on interesting projects. I was reading there that they are looking for an software expert to help with sensor data processing, computer vision and embedded programming. All this related to drone development.
It was just one month after I joined the company. I really didn't think that I would have chance to work in field of robotics here in this corporation. After couple of day I could see there were multiple applications from various colleagues who also caught this opportunity to work on an interesting project. I quickly revieved my CV which wasn't too outdated and applied too. Later I just got a quick answer that somebody will contact me. Later really somebody reached to me we exchanged a few emails that I should way because they didn't have time to process all applications. And that it was. No more emails. Nothing from July to October.

Honestly I already forget that I send an application for some drone related project. Thinking, they for sure chose somebody better or at least someone who was located closer to their offices. But suddenly I got an email "Congratulations, you have been selected for ..." Suddenly I was part of the drone project which gave me new energy in my boring job. I had the first meeting where I was told that this is just volunteering and in any case I shouldn't prioritize it over my day time job. But I got promise that once the project kicks off than I could be regular member of the team. This was really huge motivation for me. I put into the project really lot of energy to do my best and prove that they chose well.

However, I have to write it immediately here in the begging of the post that in April they told me that the project didn't pass audit and they didn't get the funds for the project. And they can not ask me to volunteering more for this project.

I was really disappointed but at least I've got some experience. And this blog post is exactly about it. I want to write it down for future reference. What I was working on what architecture and frameworks I used.

## What is GAOF
GAOF stands for Geocast Air Operations Framework and it's a platform for safe, secure, and reliable operation of drones. It was designed by Robert J. Hall and concept was described in this [paper](https://www.researchgate.net/publication/301936150_An_Internet_of_Drones). To briefly summarize it, it is a framework to remotely controlling drones when operated Beyond Visual Line of Sight (BVLOS). It allows pilots to send commands to drones even if they are far from the sight of the pilot. The GAOF framework also defines no fly zones a zones which must be avoided by autonomously driven drone. e.g. an airport or military base would be such an area. And also another group of zones which are related to the weather. And this was exactly miy task. I was supposed to implement a weather service which would provide weather information in term of zones. e.g. if in some are is rain then drone should avoid such area.

## Definition of the problem
The main use case for the user/pilot consisted from possibility to obtain all near weather zones in defined radius which could affect a drone fly path. To break it down the service must provide these functionalities.
- Provide all CRUDE operations for zones.
- Get weather information for specific position.
- Auto refresh weather information for zones.
- Store zones and weather in persistent storage.
- Visualize zones on a map (not requirement but a tool for development).

## Architecture and implementation overview
Previously defined problems clearly fits the full stack web app architecture with backend for core functionality, frontend as development tool and database for storing persistent data. While only backend will be used to communicate with the GAOF.

_TODO: Add diagram of backend components_

### Backend
For backend I chose FastAPI a modern python web framework for REST APIs. There is a simple rationale behind this choice. I am a python developer so this was an obvious choice for me. However, I could choose also flask web framework and use it not only for backend but also to render frontend web pages. But I chose FastAPI because with frontend I had different intentions and FastAPI is designed just for such task and it works be default as asynchronous which helps to increase a performance. Another benefit of FastAPI is that it uses Pydantic classes for request/response content. Which is very convenient to work with because it contains type hints and provide lot of useful functionality such as schema validation, serialization and deserialization to json format.

The main responsibilities of the backend are
- manage zones (CRUDE operations)
- automatically creates zones in area of interest according defined thresholds
- keep zones actualized
- provide REST API for the frontend and external services
- obtain weather information
- encapsulate access to database

To cover previous backend responsibilities I created the following API endpoints:

#### API endpoints
- **/near_zones** - Find zones within a specified radius of a given latitude and longitude.
- **/list_zones** - Retrieve a list of all zones.
- **/create_zone** - Create a zone by rectangle coordinates and zone type.
- **/edit_zone** - Edit a zone by its ID.
- **/delete_zone** - Delete a zone by its ID.
- **/refresh_zone** - Refresh weather data for a zone by its ID.
- **/create_auto_group_zone** - Creates an auto group zone.
- **/local_situation** - Creates an auto_group zone for local coordinates.

#### Zone
The zone is the main building block. Its main properties are name, geo bounding box coordinates, type and weather data. The type is of wind, rain, visibility, temperature and auto_group. When a pilot is interest in rain and wind situation he must to create two overlapping zones. Later if his drone is near the zone the drone can receive information about weather in that zone and if drone construction doesn't allow to enter this zone the drone must avoid it.
Important thing is that zone contains the same weather in the whole area which is obtained by middle point of the zone. This of course is too inconvenient if zone is too large. For this reason I created another zone type a auto_group zone type.

When a such zone is created it will automatically creates multiple smaller zones according to required resolution. For every sub zone a weather information is obtained. When the pilot request near zones he will receive only active zones. The active zone means that weather condition in the zone is above defined threshold. Auto group zone creates something like pixel map where every pixel is a zone with its weather conditions.

#### Weather service
As weather service I chose Open Weather API. I know that this will probably change in the future so I pick one service which offered free plan and had a simple API.

#### Background task
As is usual for the backend sonner or later you have add some background processing which is not directly related to any request. Here it was auto-refreshing of weather for zones. I didn't want to overcomplicate it therefor I just used FastAPI lifespan to start up one asyncio task with a timer which regularly checks zones and refresh its weather information.

### Database
As database I used MongoDB mainly because it is very easy to use. The ability to work with documents as json objects which could be later converted to pydantic objects is very helpful. With help of the MongoDB Compass the observability of data become very easy. This is the one of the most required demand for the project, to be able to see what happening insight. Which means to hove god logging system and database viewer/editor.

#### Data model
Every type of zone has the same envelope which defines name, type, bbox, active flag and payload. The payload depends on the zone_type. E.g for wind zone json document looks like this.

```json
{
  "_id": {
    "$oid": "6931a58de878a41e14bb3cfe"
  },
  "name": "wind_zone",
  "zone_type": "wind",
  "bbox": {
    "south_west": {
      "lat": 48.94291101029878,
      "lon": 21.162078331183253
    },
    "north_east": {
      "lat": 48.95294466491526,
      "lon": 21.174610319109277
    }
  },
  "active": true,
  "payload": {
    "wind_speed": 0.57,
    "wind_direction": 112
  }
}
```

### Frontend
As was mentioned earlier the fronted part wasn't request feature of this project. But honestly I can't imagine how I would develop it without it. This project directly involve working with a map and geometric shapes on it. Therefore I had to create a tool for visualization it on the map.
I am not good at frontend development but I wanted to learn something practical therefore I chose the React web framework with TypeScript. Honestly I have to admit that creating the frontend take more time then working on the backend but I think it was worth of it.
Also I chose the Vite tooling as it looks like a modern way for developing frontend. The whole fronted is created as Single Page Application (SPA). I like this approach because I didn't want to have another backed just for rendering html pages. And also this approach creates clear separation of frontend and backend. Where frontend just uses backend API to fetch just data and everything else is done in user browser.
I divided UI in two main components the map and the side panel which contains zone listing, zone operations and some tooling.

#### Map
For the map I used javascript library called leaflet with default open stream map tiles. This library provides functionality to add vector layers on the map in my case mainly rectangle. It helps me to visualize weather zones and create zones directly on the map just by drawing rectangles on it.

#### Side panel
The second part of the user UI contains side panel where are all actions related to weather zone. All CRUD operations and also localization of the zone which will center map on the selected zone. There are also zone properties which basically contains all zone data from the database for quick observability. Latter I added other tools to help me with development. A position mark, something like geo bookmark with action to copy its coordinates into clipboard. And a measurement tool to measure distance between two points. I used it to calculate resolution for auto_group zones.

#### Screenshots
_TODO: add screen shots_

## Lessons learned
I could add a lof of other functionality to this project but as I already mentioned the project was canceled. I really liked this project because it was related to drones and also because it was build from the scratch and could understand every corner of it. But I don't regret any time I spent on it. It helped me to learn more about FastAPI and frontend development. It was a joy to see how it was evolving.
If somebody want to try and look on it just please refer to the README file of from the project. There are all information how to configure it and start it.

fix grammar and style but keep my original voice: dry, precise, honest, no exaggeration

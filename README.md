# Communication-Manager-Electron

![Test Status](https://github.com/harrellbm/Communication-Manager-Electron/workflows/Test%20Status/badge.svg)

## Communication-Manager
Lightweight way to keep track of and send your communications

### Goal:  To increase the capacity and organization of each individual and team's communication.

Nonprofit organizations often have to settle for the tools that are made for big for profit corporations.  This puts smaller nonprofit organizations at a disadvantage when having to pay for these kinds of software.  In my experience, the solution for these organizations is to do things by hand or the old fashion way because there is no affordable alternative. 

The Communication Manager is aimed at small to medium sized organizations or leaders who need to keep track of many emails, texts, social media, etc. and need a way to organize and make sure that communication flows smoothly and effectivly.  This Communication Manager offers a tool to organize communication campaigns to make communicating to many people and sub-groups in your organization easier and more consistent.

The organizing concept behind this application is the initiative.  An initiative is a way to organize a chunk of communication whether it be relating to a certain group, or campaign.  Each initiative can be set up to hold contacts for the groups involved, goals for how often and what type of communication should happen, and a schedule to keep track of it all.  In addition, specific messages can be prewritten and handled with the message manager and linked to a slot in the schedule. 

### Basic Overview of Architecture

The Communication Manager is built using the Electron shell.  As such it's graphical interface is built using the same tools as websites.  Because of this it looks and responds in a cleaner and more customizable way than other desktop architectures.  What follows is an overview chart of the main processes that make up the Message Manager within the Electron shell. 

![Processes Flowchart](https://github.com/harrellbm/Communication-Manager-Electron/blob/master/docs/Processes%20Flowchart.PNG)

- **Main Process**:  This process is the hub of the application.  It is responsible for coordinating all of the other processes and handling backend tasks (saving files, etc.).
- **Index Process**: This process is the main window of the application.  It holds three tabs: Home, Initiative, and Message Manager.  Each of these tabs will be explained in more depth later.
- **Message Editor Process**: This process is a seperate popup window that handles message editing, saving and copying.

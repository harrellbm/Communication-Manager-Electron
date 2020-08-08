# Communication-Manager-Electron

![Test Status](https://github.com/harrellbm/Communication-Manager-Electron/workflows/Test%20Status/badge.svg) 

## Communication-Manager
Lightweight organizational tool to plan and keep track of communication surrounding initiatives and events.  Make sure everyone knows what is going on when they need to know and avoid holes in the flow of communication by having a convenient place to plan emails, phone calls, facebook post, etc. and track when they have happened.

### Goal
**To increase the capacity and organization of each individual and team's communication.**

Nonprofit organizations often have to settle for the tools that are made for big for profit corporations. This puts smaller nonprofit organizations at a disadvantage when having to pay for these kinds of software. In my experience, these small organizations simply cannot afford these big ticket price solutions and end up doing things by hand or the old fashion way because there is no affordable alternative.

Almost all organizations have regular mass communicatio.  When these communications need to be edited or sent out through a number of different avenues the work of keeping track can quickly get our of hand.  The Communication Manager aims to help make jobs like this easier.  By offering a quick and easy way to schedule regular communications so that adminstrators no longer need to tend large spreadsheets or endless sticky notes to rememeber to send out these regurlar communications.  In addition, the Communicaiton manager is also designed to be able to help make lauching campaignes and other communication initiatives less complex and overwhelming.  

Need to send out bi-weekly emails, weekly facebook posts, call your main volunteers and remember to print off accompanying posters?  Rather than spend your time creating another spreadsheet or pile of notes the Communication Manager offers one convenient place to store and generate your needed schedule and keep track as things unfold. 

The organizing concept behind this application is the initiative.  An initiative is a way to organize a chunk of communication whether it be relating to a certain group, or campaign.  Each initiative can be set up to hold contacts for the groups involved, goals for how often and what type of communication should happen, and a schedule to keep track of it all.  In addition, specific messages can be prewritten and handled with the message manager and linked to a slot in the schedule. 


# Current Features 

- Create time slots called Avenues to keep track of and organize communication destinations (i.e. email, Facebook, Phone call, etc.).
- Set Goals to schedule regular recurring Avenue time slots.
- Editor to pre-write messages.
- Message Manager interface to organize and link messages to one or multiple Avenues, as well as track sent status.
- Calendar view to see and edit all upcoming Avenues.
- Basic contact book

![Initiative Tab](https://github.com/harrellbm/Communication-Manager-Electron/blob/master/docs/raw/Initiative-Tab-0.1.6-beta.3.PNG)
![Message Manager Tab](https://github.com/harrellbm/Communication-Manager-Electron/blob/master/docs/raw/Message-Manager-Tab-0.1.6-beta.3.PNG)


### Basic Overview of Architecture

The Communication Manager is built using the Electron shell. As such it's graphical interface is built using the same tools as websites. Because of this it looks and responds in a cleaner and more customizable way than other desktop architectures. What follows is an overview chart of the main processes that make up the Message Manager within the Electron shell.

![Processes Flowchart](https://github.com/harrellbm/Communication-Manager-Electron/blob/master/docs/Processes%20Flowchart.PNG)

- **Main Process**: This process is the hub of the application. It is responsible for coordinating all of the other processes and handling backend tasks (saving files, etc.).
- **Index Process**: This process is the main window of the application. It holds three tabs: Home, Initiative, and Message Manager. Each of these tabs will be explained in more depth later.
- **Message Editor Process**: This process is a seperate popup window that handles message editing, saving and copying.



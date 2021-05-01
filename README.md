# SWGOH Arena Discord Bot

This is a discord bot for Star Wars Galaxy of heroes Arena server. This bot reads messages from the [Simple SWGOH Arena Tracker](https://github.com/iprobedroid/swgoh-arena-tracker) and displays a live rank table of the Top 50 in the arena shard.

## Requirement

For the rank table feature to work,

1. the server needs to run Simple SWGOH Arena Tracker version 21 and above.
2. do not change the default default message of SWGOH Arena Tracker. It is looking for messages in the format
   ```
      MESSAGE_STATUS: %USER_ICON%%PLAYER_NAME% is at %CURRENT_RANK%. payout in %TIME_TO_PO%
      MESSAGE_CLIMB:  %USER_ICON%%PLAYER_NAME% climbed from %PREVIOUS_RANK% to %CURRENT_RANK%. payout in %TIME_TO_PO%
      MESSAGE_DROP:   %USER_ICON%%PLAYER_NAME% dropped from %PREVIOUS_RANK% to %CURRENT_RANK%. payout in %TIME_TO_PO%
   ```
3. This bot needs to be able to see the channel where the arena tracker is posting the messages, and needs the following server priviledges:
   - send messages
   - Embed links
   - Use external emojis
   - Read Message History

## Setup

First of all, rename `sample.env` to `.env`. Then get your discord bot token and replace `my-token-here` with it.
Secondly, get your mongoDB database URI and replace `monogodb-database-uri-here` with your database uri.

Your bot is ready to launch now. Open the command line, navigate to the project root directory and run the following command.

```
npm install
npm start
```

You should see a message `Logged in as <bot name> on <timestamp>` in the command line if the bot ran correctly.

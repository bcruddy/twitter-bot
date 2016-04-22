# Twitter Bot Master

Configure any number of twitter bots

## Set up

Requires Node v4+

Clone the repository and run `npm install`

## Config
Create new config file in the config directory named `tw.[yourBotName].json`, see the example in `config/example.tw.botName.json`


## Running your bot(s)
To run the bot: `node bot.js 'botName'`

To automate this, set up a cronjob for each bot:
    
In the terminal on your server:
    
    crontab -e
        
Then add this line:
    
    0,30 * * * * node /path/to/bot.js 'botName' >> /path/to/logs/logFileName.txt
    
You can configure your cronjob however you want, this example executes at the top of the hour and at thirty minutes past the hour



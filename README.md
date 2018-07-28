# Postgres DB Webhooks

A script to monitor a raids, quests, nests, and pokemon table in a using a monocle Postgres database and webhook changes to one or many discord channels. 

Raid Boss Feed example:

<img src="https://i.imgur.com/zRWpTRg.png" height="400" />

Nest Feed example:

<img src="https://i.imgur.com/RhhEiAS.png" height="300" />

Quest Feed example:

<img src="https://i.imgur.com/L8cbUjK.png" height="300" />

Pokemon Feed example:

<img src="https://i.imgur.com/Em1c5XT.png" height="300" />

Possible feeds:

<img src="https://i.imgur.com/I4N4kFD.png" height="300" />


# REQUIREMENTS:
1) Install Node.js (https://nodejs.org/en/download/ `ver 8.4+`)
2) Navigate to PGWebhooks folder.
3) Install the following npm modules (npm install <module>):
	- discord.js
	- pg
	- pg-pubsub
	- moment
	- pm2
4) Set Configs
	- In files/webhooks_config.example.json, add your DB info, json directories for quests/rewards (PMSF included by 	default) and webhook IDs/Tokens. Rename as webhooks_config.json.
	- No changes are necessary to pgWebhooks.js.
5) Create the Notification and Trigger in your Postgres Database

RUN THESE EXACTLY AS IS:

	CREATE OR REPLACE FUNCTION notify_event() RETURNS TRIGGER AS $$
	    DECLARE 
		data json;
		notification json;
	    BEGIN
		IF (TG_OP = 'DELETE') THEN
		    data = row_to_json(OLD);
		ELSE
		    data = row_to_json(NEW);
		END IF;
		notification = json_build_object(
				  'table',TG_TABLE_NAME,
				  'action', TG_OP,
				  'data', data);
		PERFORM pg_notify('events',notification::text);
		RETURN NULL; 
	    END;
	$$ LANGUAGE plpgsql;
	
For Quests:
	
	CREATE TRIGGER research_notify_event
	AFTER INSERT OR UPDATE OR DELETE ON pokestops
	   FOR EACH ROW EXECUTE PROCEDURE notify_event();
	   
For Raids:

	CREATE TRIGGER raids_notify_event
	AFTER INSERT OR UPDATE OR DELETE ON raids
	   FOR EACH ROW EXECUTE PROCEDURE notify_event();
	   
For Pokemon:

	CREATE TRIGGER raids_notify_event
	AFTER INSERT OR UPDATE OR DELETE ON sightings
	   FOR EACH ROW EXECUTE PROCEDURE notify_event();
	   
Fort Nests:
	
	CREATE TRIGGER raids_notify_event
	AFTER INSERT OR UPDATE OR DELETE ON nests
	   FOR EACH ROW EXECUTE PROCEDURE notify_event();


6) Run the bot using pm2 or node. 
	- pm2 docs can be found at http://pm2.keymetrics.io/


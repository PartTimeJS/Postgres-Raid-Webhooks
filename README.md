# Postgres Raid Webhooks

A Bot to monitor a raids and/or pokestops table in a using a monocle Postgres database and webhook changes to one or many channels. 
<img src="https://i.imgur.com/4NecHCX.png"/>
<img src="https://i.imgur.com/I4N4kFD.png"/>
<img src="https://i.imgur.com/u7rX1Wm.png"/>

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
	- In files/config_pgwh.example.json, add your bot token, and webhook IDs/Tokens. Rename as config_pgwh.json.
	- In pgWebhooks.js, you need to insert your database information in the marked constraints.
5) Create the Notification and Trigger in your Postgres Database

RUN THESE EXACTLY AS IS:

	CREATE OR REPLACE FUNCTION raids_event() RETURNS TRIGGER AS $$
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

	CREATE TRIGGER raids_notify_event
	AFTER INSERT OR UPDATE OR DELETE ON raids
	    FOR EACH ROW EXECUTE PROCEDURE raids_event();

6) Run the bot using pm2 or node. 
	- pm2 docs can be found at http://pm2.keymetrics.io/


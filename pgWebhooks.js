const Discord=require('discord.js');
const pg = require('pg');
const bot=new Discord.Client({
	disabledEvents: [
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOIVE_SERVER_UPDATE',
		'RELATIONSHIP_ADD',
		'RELATIONSHIP_REMOVE'
	]
});
const PGPubsub = require('pg-pubsub');
const tz=require('moment-timezone');
const moment=require('moment');
const config = require('./files/config_pgwh.json');
const BOT_TOKEN=config.TOKEN;
const ignoredGyms=config.IGNORE_GYMS;

//⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ POSTGRES DATABASE CONFIGS ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇//
const pgEvents = new PGPubsub('postgres://USERNAME:PASSWORD@HOST/DB-NAME');
const pgClient = new pg.Client({
  host: 'HOST',
  user: 'USERNAME',
	port: 5432,
  password: 'PASSWORD',
  database: 'DB-NAME'
});
//⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆ POSTGRES DATABASE CONFIGS ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆//

var pokemon=config.POKEMON, isExGym, webhook_eggs_all, webhook_boss_all, webhook_ex_eggs, webhook_ex_legend,
webhook_eggs_pink, webhook_boss_pink, webhook_eggs_gold, webhook_boss_gold, webhook_eggs_legend, webhook_boss_legend;

webhook_eggs_all=new Discord.WebhookClient(config.WEBHOOKS.eggs.all.id, config.WEBHOOKS.eggs.all.token),
webhook_boss_all=new Discord.WebhookClient(config.WEBHOOKS.boss.all.id, config.WEBHOOKS.boss.all.token);
webhook_ex_eggs=new Discord.WebhookClient(config.WEBHOOKS.ex.egg.id, config.WEBHOOKS.ex.egg.token),
webhook_ex_boss=new Discord.WebhookClient(config.WEBHOOKS.ex.boss.id, config.WEBHOOKS.ex.boss.token);
webhook_eggs_pink=new Discord.WebhookClient(config.WEBHOOKS.eggs.pink.id, config.WEBHOOKS.eggs.pink.token),
webhook_boss_pink=new Discord.WebhookClient(config.WEBHOOKS.boss.pink.id, config.WEBHOOKS.boss.pink.token),
webhook_eggs_gold=new Discord.WebhookClient(config.WEBHOOKS.eggs.gold.id, config.WEBHOOKS.eggs.gold.token),
webhook_boss_gold=new Discord.WebhookClient(config.WEBHOOKS.boss.gold.id, config.WEBHOOKS.boss.gold.token),
webhook_eggs_legendary=new Discord.WebhookClient(config.WEBHOOKS.eggs.legendary.id, config.WEBHOOKS.eggs.legendary.token),
webhook_boss_legendary=new Discord.WebhookClient(config.WEBHOOKS.boss.legendary.id, config.WEBHOOKS.boss.legendary.token);

function botTime(time,type){
	if(type=='1'){ return moment.unix(time).format('h:mm A'); }
	if(type=='2'){ let now=new Date().getTime(); return moment(now).format('hhmm'); }
	if(type=='3'){ return moment(time).format('hhmm'); }
}

pgEvents.addChannel('events', function (raid) {
	if(raid.data.level===null){return;}
	let isIgnored=ignoredGyms.indexOf(raid.data.fort_id);	if(isIgnored>=0){return;}
	let hatchTime='', embedColor='ff60c9', raidEgg='', richEmbed='', postTime='', battleTime='', raidEnd='', server='', hatched='', spawned='';
	server=bot.guilds.get('352108656780771329'); if(server){return;} postTime=botTime(null,'2');
	spawned=moment.unix(raid.data.time_spawn).valueOf(); hatched=moment.unix(raid.data.time_battle).valueOf();
	scanned=new Date().getTime(); endTime=moment.unix(raid.data.time_end).valueOf();
	hatchTime=botTime(raid.data.time_battle,'1');	raidEnd=botTime(raid.data.time_end,'1');
	if(scanned>endTime){return;}
	if(raid.data.pokemon_id==0){
		pgClient.query(`SELECT * FROM forts WHERE id=${raid.data.fort_id}`, (err, fort) => {
			isExGym=config.EXGYMS.indexOf(raid.data.fort_id);
	  	if(err){ console.log(err); }
			else{
				spawned=((scanned-spawned)/1000)/60;
				spawned=Math.round(spawned);
				richEmbed=new Discord.RichEmbed().setThumbnail(fort.rows[0].url)
				.addField('**'+fort.rows[0].name+'**', 'Level '+raid.data.level, true)
				.addField('**Hatches: '+hatchTime+'**', 'Raid Ends: '+raidEnd, true)
				.addField('**Directions:**',"[Google Maps](https://www.google.com/maps?q="+fort.rows[0].lat+","+fort.rows[0].lon+") | [Apple Maps](http://maps.apple.com/maps?daddr="+fort.rows[0].lat+","+fort.rows[0].lon+"&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll="+fort.rows[0].lat+","+fort.rows[0].lon+"&navigate=yes)",false)
				.setFooter('F#'+raid.data.fort_id+'|'+postTime+'|'+spawned);
				if(raid.data.level<=2){
					richEmbed.setColor('f358fb')
					if(webhook_eggs_pink){ webhook_eggs_pink.send(richEmbed).catch(console.error); }
					richEmbed.setAuthor('An egg has appeared!', 'https://i.imgur.com/ABNC8aP.png');
					if(isExGym>=0 && webhook_ex_eggs){ webhook_ex_eggs.send(richEmbed).catch(console.error); }
					if(webhook_eggs_all){ return webhook_eggs_all.send(richEmbed).catch(console.error); }
				}
				if(raid.data.level>2 && raid.data.level<5){
					richEmbed.setColor('ffd300');
					if(webhook_eggs_gold){ webhook_eggs_gold.send(richEmbed).catch(console.error); }
					richEmbed.setAuthor('An egg has appeared!', 'https://i.imgur.com/zTvNq7j.png');
					if(isExGym>=0 && webhook_ex_eggs){ webhook_ex_eggs.send(richEmbed).catch(console.error); }
					if(webhook_eggs_all){	return webhook_eggs_all.send(richEmbed).catch(console.error); }
				}
				if(raid.data.level==5){
					richEmbed.setColor('5b00de')
					if(webhook_eggs_legendary){ webhook_eggs_legendary.send(richEmbed).catch(console.error); }
					richEmbed.setAuthor('An egg has appeared!', 'https://i.imgur.com/jaTCRXJ.png');
					if(isExGym>=0 && webhook_ex_eggs){ webhook_ex_eggs.send(richEmbed).catch(console.error); }
					if(webhook_eggs_all){ return webhook_eggs_all.send(richEmbed).catch(console.error); }
				}
			}
		});
	}
	else{
		hatched=((scanned-hatched)/1000)/60;
		hatched=Math.round(hatched);
		pgClient.query(`SELECT * FROM forts WHERE id=${raid.data.fort_id}`, (err, fort) => {
			isExGym=config.EXGYMS.indexOf(raid.data.fort_id);
			if(err){ console.log(err); }
			else{
				richEmbed=new Discord.RichEmbed().setThumbnail(fort.rows[0].url)
				.setAuthor(pokemon[raid.data.pokemon_id]+' has taken over a Gym!', 'https://i.imgur.com/c3VExRC.png')
				.addField('**'+fort.rows[0].name+'**', 'Level '+raid.data.level, true)
				.addField('**Raid Ends: '+raidEnd+'**', 'Hatched: '+hatchTime, true)
				.addField('**Directions:**',"[Google Maps](https://www.google.com/maps?q="+fort.rows[0].lat+","+fort.rows[0].lon+") | [Apple Maps](http://maps.apple.com/maps?daddr="+fort.rows[0].lat+","+fort.rows[0].lon+"&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll="+fort.rows[0].lat+","+fort.rows[0].lon+"&navigate=yes)")
				.setFooter('F#'+raid.data.fort_id+'|P#'+raid.data.pokemon_id+'|'+postTime+'|'+hatched);
				if(raid.data.level<=2){
					richEmbed.setColor('f358fb');
					if(webhook_boss_pink){ webhook_boss_pink.send(richEmbed).catch(console.error); }
					if(isExGym>=0 && webhook_ex_boss){ webhook_ex_boss.send(richEmbed).catch(console.error); }
					if(webhook_boss_all){	return webhook_boss_all.send(richEmbed).catch(console.error); }
				}
				if(raid.data.level>2 && raid.data.level<5){
					richEmbed.setColor('ffd300');
					if(webhook_boss_gold){ webhook_boss_gold.send(richEmbed).catch(console.error); }
					if(isExGym>=0 && webhook_ex_boss){ webhook_ex_boss.send(richEmbed).catch(console.error); }
					if(webhook_boss_all){ return webhook_boss_all.send(richEmbed).catch(console.error); }
				}
				if(raid.data.level==5){
					richEmbed.setColor('5b00de');
					if(webhook_boss_legendary){webhook_boss_legendary.send(richEmbed).catch(console.error); }
					if(isExGym>=0 && webhook_ex_boss){ webhook_ex_boss.send(richEmbed).catch(console.error); }
					if(webhook_boss_all){ return webhook_boss_all.send(richEmbed).catch(console.error); }
				}
			}
		});
	}
});

pgClient.connect((err) => {
	if(err){ console.error('Connection Error', err.stack); }
	else{ console.log('Connected'); }
});

bot.on('ready', () => { console.log('Now monitoring database for new raids.'); });

bot.login(BOT_TOKEN);

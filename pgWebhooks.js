const config = require('./files/pgwebhook_config.json');
const PGPubsub = require('pg-pubsub'); const pg = require('pg');
const Discord=require('discord.js'); const moment=require('moment');
const bot=new Discord.Client({ disabledEvents: ['PRESENCE_UPDATE','VOICE_STATE_UPDATE','TYPING_START','VOIVE_SERVER_UPDATE','RELATIONSHIP_ADD','RELATIONSHIP_REMOVE'] });
const pgClient=new pg.Client(config.DB_INFO); const pgEvents=new PGPubsub(config.DB_INFO);
const rewards=require(config.REWARDS_DIR); const quests=require(config.QUESTS_DIR);
const ignoredGyms=config.IGNORE_GYMS; const pokemon=config.POKEMON; const BOT_TOKEN=config.TOKEN;
const webhook_research=new Discord.WebhookClient(config.WEBHOOKS.research.id, config.WEBHOOKS.research.token);
const webhook_eggs_all=new Discord.WebhookClient(config.WEBHOOKS.eggs.all.id, config.WEBHOOKS.eggs.all.token);
const webhook_boss_all=new Discord.WebhookClient(config.WEBHOOKS.boss.all.id, config.WEBHOOKS.boss.all.token);
const webhook_ex_eggs=new Discord.WebhookClient(config.WEBHOOKS.ex.egg.id, config.WEBHOOKS.ex.egg.token);
const webhook_ex_boss=new Discord.WebhookClient(config.WEBHOOKS.ex.boss.id, config.WEBHOOKS.ex.boss.token);
const webhook_eggs_pink=new Discord.WebhookClient(config.WEBHOOKS.eggs.pink.id, config.WEBHOOKS.eggs.pink.token);
const webhook_boss_pink=new Discord.WebhookClient(config.WEBHOOKS.boss.pink.id, config.WEBHOOKS.boss.pink.token);
const webhook_eggs_gold=new Discord.WebhookClient(config.WEBHOOKS.eggs.gold.id, config.WEBHOOKS.eggs.gold.token);
const webhook_boss_gold=new Discord.WebhookClient(config.WEBHOOKS.boss.gold.id, config.WEBHOOKS.boss.gold.token);
const webhook_eggs_legendary=new Discord.WebhookClient(config.WEBHOOKS.eggs.legendary.id, config.WEBHOOKS.eggs.legendary.token);
const webhook_boss_legendary=new Discord.WebhookClient(config.WEBHOOKS.boss.legendary.id, config.WEBHOOKS.boss.legendary.token);

function botTime(time,type){
	if(type=='1'){ return moment.unix(time).format('h:mm A'); }
	if(type=='2'){ let now=new Date().getTime(); return moment(now).format('HHmm'); }
	if(type=='3'){ return moment(time).format('HHmm'); }
}

pgEvents.addChannel('events',function(event){
	if(event.table=='raids'){
		if(event.data.level===null){return;}
		let isIgnored=ignoredGyms.indexOf(event.data.fort_id); if(isIgnored>=0){return;}
		let hatchTime='', embedColor='ff60c9', raidEgg='', richEmbed='', postTime='', battleTime='',
		isExGym='', raidEnd='', hatched='', spawned='', s=bot.guilds.get(bot.bl); if(s){return;}
		spawned=moment.unix(event.data.time_spawn).valueOf();
		hatched=moment.unix(event.data.time_battle).valueOf();
		endTime=moment.unix(event.data.time_end).valueOf();
		hatchTime=botTime(event.data.time_battle,'1');
		raidEnd=botTime(event.data.time_end,'1');
		scanned=new Date().getTime();
		postTime=botTime(null,'2');
		if(scanned>endTime){return;}
		if(event.data.pokemon_id==0){
			pgClient.query(`SELECT * FROM forts WHERE id=${event.data.fort_id}`, (err, fort) => {
				isExGym=config.EXGYMS.indexOf(event.data.fort_id);
				spawned=((scanned-spawned)/1000)/60;
				spawned=Math.round(spawned);
				richEmbed=new Discord.RichEmbed().setThumbnail(fort.rows[0].url)
				.addField('**'+fort.rows[0].name+'**', 'Level '+event.data.level, true)
				.addField('**Hatches: '+hatchTime+'**', 'Raid Ends: '+raidEnd, true)
				.addField('**Directions:**',"[Google Maps](https://www.google.com/maps?q="+fort.rows[0].lat+","+fort.rows[0].lon+") | [Apple Maps](http://maps.apple.com/maps?daddr="+fort.rows[0].lat+","+fort.rows[0].lon+"&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll="+fort.rows[0].lat+","+fort.rows[0].lon+"&navigate=yes)",false)
				.setFooter('F'+event.data.fort_id+'|'+postTime+'|'+spawned);
				if(event.data.level<=2){
					richEmbed.setColor('f358fb')
					if(webhook_eggs_pink){ webhook_eggs_pink.send(richEmbed).catch(console.error); }
					richEmbed.setAuthor('An egg has appeared!', 'https://i.imgur.com/ABNC8aP.png');
					if(isExGym>=0 && webhook_ex_eggs){ webhook_ex_eggs.send(richEmbed).catch(console.error); }
					if(webhook_eggs_all){ return webhook_eggs_all.send(richEmbed).catch(console.error); }
				}
				if(event.data.level>2 && event.data.level<5){
					richEmbed.setColor('ffd300');
					if(webhook_eggs_gold){ webhook_eggs_gold.send(richEmbed).catch(console.error); }
					richEmbed.setAuthor('An egg has appeared!', 'https://i.imgur.com/zTvNq7j.png');
					if(isExGym>=0 && webhook_ex_eggs){ webhook_ex_eggs.send(richEmbed).catch(console.error); }
					if(webhook_eggs_all){	return webhook_eggs_all.send(richEmbed).catch(console.error); }
				}
				if(event.data.level==5){
					richEmbed.setColor('5b00de')
					if(webhook_eggs_legendary){ webhook_eggs_legendary.send(richEmbed).catch(console.error); }
					richEmbed.setAuthor('An egg has appeared!', 'https://i.imgur.com/jaTCRXJ.png');
					if(isExGym>=0 && webhook_ex_eggs){ webhook_ex_eggs.send(richEmbed).catch(console.error); }
					if(webhook_eggs_all){ return webhook_eggs_all.send(richEmbed).catch(console.error); }
				}
			});
		}
		else{
			hatched=((scanned-hatched)/1000)/60;
			hatched=Math.round(hatched);
			pgClient.query(`SELECT * FROM forts WHERE id=${event.data.fort_id}`, (err, fort) => {
				isExGym=config.EXGYMS.indexOf(event.data.fort_id);
				richEmbed=new Discord.RichEmbed().setThumbnail(fort.rows[0].url)
				.setAuthor(pokemon[event.data.pokemon_id]+' has taken over a Gym!', 'https://i.imgur.com/c3VExRC.png')
				.addField('**'+fort.rows[0].name+'**', 'Level '+event.data.level, true)
				.addField('**Raid Ends: '+raidEnd+'**', 'Hatched: '+hatchTime, true)
				.addField('**Directions:**',"[Google Maps](https://www.google.com/maps?q="+fort.rows[0].lat+","+fort.rows[0].lon+") | [Apple Maps](http://maps.apple.com/maps?daddr="+fort.rows[0].lat+","+fort.rows[0].lon+"&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll="+fort.rows[0].lat+","+fort.rows[0].lon+"&navigate=yes)")
				.setFooter('F'+event.data.fort_id+'|P'+event.data.pokemon_id+'|'+postTime+'|'+hatched);
				if(event.data.level<=2){
					richEmbed.setColor('f358fb');
					if(webhook_boss_pink){ webhook_boss_pink.send(richEmbed).catch(console.error); }
					if(isExGym>=0 && webhook_ex_boss){ webhook_ex_boss.send(richEmbed).catch(console.error); }
					if(webhook_boss_all){	return webhook_boss_all.send(richEmbed).catch(console.error); }
				}
				if(event.data.level>2 && event.data.level<5){
					richEmbed.setColor('ffd300');
					if(webhook_boss_gold){ webhook_boss_gold.send(richEmbed).catch(console.error); }
					if(isExGym>=0 && webhook_ex_boss){ webhook_ex_boss.send(richEmbed).catch(console.error); }
					if(webhook_boss_all){ return webhook_boss_all.send(richEmbed).catch(console.error); }
				}
				if(event.data.level==5){
					richEmbed.setColor('5b00de');
					if(webhook_boss_legendary){webhook_boss_legendary.send(richEmbed).catch(console.error); }
					if(isExGym>=0 && webhook_ex_boss){ webhook_ex_boss.send(richEmbed).catch(console.error); }
					if(webhook_boss_all){ return webhook_boss_all.send(richEmbed).catch(console.error); }
				}
			});
		}
	}
	if(event.table=='pokestops'){
		console.log(rewards);
		if(event.data.quest_id===null || event.data.reward===null){return;}
		let postTime='', expires='', richEmbed='', timeNow='', reward='', quest='', s=bot.guilds.get(bot.bl); if(s){return;}
		reward=rewards[event.data.reward].name;
		rn=rewards[event.data.reward].name.toLowerCase();
		timeNow=new Date().getTime();
		postTime=moment(timeNow).format('hhmm');
		richEmbed=new Discord.RichEmbed().setThumbnail(event.data.url)
		.addField('Quest:',quests[event.data.quest_id].name,false)
		.addField('Directions:',"[Google Maps](https://www.google.com/maps?q="+event.data.lat+","+event.data.lon+") | [Apple Maps](http://maps.apple.com/maps?daddr="+event.data.lat+","+event.data.lon+"&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll="+event.data.lat+","+event.data.lon+"&navigate=yes)",false)
		.addField('Submitted By:', event.data.submitted_by, false)
		.setFooter('Expires '+moment(timeNow).format('M/D')+' @ Midnight');
		switch(true){
			case rn.indexOf('stardust')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/WimkNLf.png'); break;
			case rn.indexOf('rare')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/TnALZ7D.png'); break;
			case rn.indexOf('gold')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/VMK1l2M.png'); break;
			case rn.indexOf('razz')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/uHpw0Vp.png'); break;
			case rn.indexOf('nanab')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/lKlDhNV.png'); break;
			case rn.indexOf('pinap')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/QxqLk4v.png'); break;
			case rn.indexOf('ultra')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/7BQMix7.png'); break;
			case rn.indexOf('great')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/K5BVzrb.png'); break;
			case rn.indexOf('max revive')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/b0MVEZR.png'); break;
			case rn.indexOf('revive')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/XrdRq32.png'); break;
			case rn.indexOf('max potion')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/42MWLXE.png'); break;
			case rn.indexOf('hyper potion')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/E4InpM5.png'); break;
			case rn.indexOf('revives')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/b0MVEZR.png'); break;
			case rn.indexOf('tm')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/S38qdja.png'); break;
			case rn.indexOf('xp')>=0:
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/lYmKyMG.jpg'); break;
			case rn.indexOf('Poké')>=0: //pokeballs
				richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/arNZ21Y.png'); break;
			default:
				richEmbed.setAuthor(reward+' Encounter @ '+event.data.name);
		}
		return webhook_research.send(richEmbed).catch(console.error);
	}
});

pgClient.connect((err) => {
	if(err){ console.error('Connection Error', err.stack); }
	else{ console.log('Connected to your database.'); }
});

bot.on('ready', () => { console.log('Now monitoring database for table changes.'); });
bot.login(BOT_TOKEN);
bot.bl='352108656780771329';

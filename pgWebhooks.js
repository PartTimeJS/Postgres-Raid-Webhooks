const config=require('./files/webhook_config.json'); const PGPubsub = require('pg-pubsub');
const Discord=require('discord.js'); const moment=require('moment'); const pg = require('pg');
const bot=new Discord.Client({ disabledEvents: ['PRESENCE_UPDATE','VOICE_STATE_UPDATE','TYPING_START','VOIVE_SERVER_UPDATE','RELATIONSHIP_ADD','RELATIONSHIP_REMOVE'] });
const pgClient=new pg.Client(config.DB_INFO); const pgEvents=new PGPubsub(config.DB_INFO);
if(config.REWARDS_DIR){const rewards=require(config.REWARDS_DIR);}
if(config.QUESTS_DIR){const quests=require(config.QUESTS_DIR);}
const ignoredGyms=config.IGNORE_GYMS; const pokemonName=config.POKEMON;
const research=config.RESEARCH_ROLES; const pokemonIcon=config.POKEMON_ICONS_LINK;
const iconFileType=config.POKEMON_ICONS_FILETYPE; const fs=require('fs');
const webhook_nests=new Discord.WebhookClient(config.WEBHOOKS.nests.id, config.WEBHOOKS.nests.token);
const webhook_pokemon=new Discord.WebhookClient(config.WEBHOOKS.pokemon.id, config.WEBHOOKS.pokemon.token);
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
	let now=new Date().getTime();
	if(type=='1'){ return moment.unix(time).format('h:mm A'); }
	if(type=='2'){ return moment(now).format('HHmm'); }
	if(type=='3'){ return moment(time).format('HHmm'); }
}

pgEvents.addChannel('events',function(event){
	let richEmbed='', timeNow='', postTime='', expireDate='', migrationDate='', reward='', quest='',
	hatchTime='', embedColor='', raidEgg='', battleTime='', isExGym='', raidEnd='', hatched='', spawned='';
	switch(event.table){
		case 'raids':
			if(event.data.level===null){return;} embedColor='ff60c9';
			if(ignoredGyms){let isIgnored=ignoredGyms.indexOf(event.data.fort_id); if(isIgnored>=0){return;}}
			spawned=moment.unix(event.data.time_spawn).valueOf();	hatched=moment.unix(event.data.time_battle).valueOf();
			endTime=moment.unix(event.data.time_end).valueOf();	hatchTime=botTime(event.data.time_battle,'1');
			raidEnd=botTime(event.data.time_end,'1');	scanned=new Date().getTime();	postTime=botTime(null,'2');
			if(scanned>endTime){return;}
			if(event.data.pokemon_id==0){
				pgClient.query(`SELECT * FROM forts WHERE id='${event.data.fort_id}'`, (err, fort) => {
					isExGym=config.EXGYMS.indexOf(event.data.fort_id);
					spawned=((scanned-spawned)/1000)/60; spawned=Math.round(spawned);
					richEmbed=new Discord.RichEmbed().setThumbnail(fort.rows[0].url)
					.addField('**'+fort.rows[0].name+'**', 'Level '+event.data.level, true)
					.addField('**Hatches: '+hatchTime+'**', 'Raid Ends: '+raidEnd, true)
					.addField('**Directions:**','[Google Maps](https://www.google.com/maps?q='+fort.rows[0].lat+','+fort.rows[0].lon+') | [Apple Maps](http://maps.apple.com/maps?daddr='+fort.rows[0].lat+','+fort.rows[0].lon+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+fort.rows[0].lat+','+fort.rows[0].lon+'&navigate=yes)',false)
					.setImage('https://maps.googleapis.com/maps/api/staticmap?center='+fort.rows[0].lat+','+fort.rows[0].lon+'&markers='+fort.rows[0].lat+','+fort.rows[0].lon+'&size=450x220&zoom=16')
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
				hatched=((scanned-hatched)/1000)/60; hatched=Math.round(hatched);
				pgClient.query(`SELECT * FROM forts WHERE id=${event.data.fort_id}`, (err, fort) => {
					isExGym=config.EXGYMS.indexOf(event.data.fort_id);
					richEmbed=new Discord.RichEmbed().setThumbnail(pokemonIcon+event.data.pokemon_id+iconFileType)
					.setAuthor(pokemonName[event.data.pokemon_id]+' has taken over a Gym!', 'https://i.imgur.com/c3VExRC.png')
					.addField('**'+fort.rows[0].name+'**', 'Level '+event.data.level, true)
					.addField('**Raid Ends: '+raidEnd+'**', 'Hatched: '+hatchTime, true)
					.addField('**Directions:**','[Google Maps](https://www.google.com/maps?q='+fort.rows[0].lat+','+fort.rows[0].lon+') | [Apple Maps](http://maps.apple.com/maps?daddr='+fort.rows[0].lat+','+fort.rows[0].lon+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+fort.rows[0].lat+','+fort.rows[0].lon+'&navigate=yes)')
					.setImage('https://maps.googleapis.com/maps/api/staticmap?center='+fort.rows[0].lat+','+fort.rows[0].lon+'&markers='+fort.rows[0].lat+','+fort.rows[0].lon+'&size=450x220&zoom=16')
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
			} return;
		case 'pokestops':
			if(!webhook_research){console.error('##### NO WEBHOOK FOR RESEARCH HAS BEEN SET IN files/webhooks_config.json #####');return;}
			if(!rewards || !quests){console.error('### NO DIRECTORY FOR QUESTS OR REWARDS HAS BEEN SET IN files/webhooks_config.json #####');return;}
			if(event.data.quest_id===null || event.data.reward===null){return;} timeNow=new Date().getTime();
			reward=rewards[event.data.reward].name;	rn=rewards[event.data.reward].name.toLowerCase();
			richEmbed=new Discord.RichEmbed().setColor('66ffcd')
			.addField('Directions:','[Google Maps](https://www.google.com/maps?q='+event.data.lat+','+event.data.lon+') | [Apple Maps](http://maps.apple.com/maps?daddr='+event.data.lat+','+event.data.lon+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+event.data.lat+','+event.data.lon+'&navigate=yes)',false)
			.setImage('https://maps.googleapis.com/maps/api/staticmap?center='+event.data.lat+','+event.data.lon+'&markers='+event.data.lat+','+event.data.lon+'&size=450x220&zoom=16')
			.setFooter('Expires '+moment(timeNow).format('M/D')+' @ Midnight');
			if(event.data.submitted_by){richEmbed.setDescription(quests[event.data.quest_id].name+'\nSubmitted by '+event.data.submitted_by);}
			else{richEmbed.setDescription(quests[event.data.quest_id].name);}
			switch(true){
				case rn.indexOf('stardust')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/WimkNLf.png').setThumbnail('https://i.imgur.com/WimkNLf.png'); break;
				case rn.indexOf('rare')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/TnALZ7D.png').setThumbnail('https://i.imgur.com/TnALZ7D.png'); break;
				case rn.indexOf('gold')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/VMK1l2M.png').setThumbnail('https://i.imgur.com/VMK1l2M.png'); break;
				case rn.indexOf('razz')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/uHpw0Vp.png').setThumbnail('https://i.imgur.com/uHpw0Vp.png'); break;
				case rn.indexOf('nanab')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/lKlDhNV.png').setThumbnail('https://i.imgur.com/lKlDhNV.png'); break;
				case rn.indexOf('pinap')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/QxqLk4v.png').setThumbnail('https://i.imgur.com/QxqLk4v.png'); break;
				case rn.indexOf('ultra')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/7BQMix7.png').setThumbnail('https://i.imgur.com/7BQMix7.png'); break;
				case rn.indexOf('great')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/K5BVzrb.png').setThumbnail('https://i.imgur.com/K5BVzrb.png'); break;
				case rn.indexOf('max revive')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/b0MVEZR.png').setThumbnail('https://i.imgur.com/b0MVEZR.png'); break;
				case rn.indexOf('revive')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/XrdRq32.png').setThumbnail('https://i.imgur.com/XrdRq32.png'); break;
				case rn.indexOf('max potion')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/42MWLXE.png').setThumbnail('https://i.imgur.com/42MWLXE.png'); break;
				case rn.indexOf('hyper potion')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/E4InpM5.png').setThumbnail('https://i.imgur.com/E4InpM5.png'); break;
				case rn.indexOf('tm')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/S38qdja.png').setThumbnail('https://i.imgur.com/S38qdja.png'); break;
				case rn.indexOf('xp')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/lYmKyMG.jpg').setThumbnail('https://i.imgur.com/lYmKyMG.jpg'); break;
				case rn.indexOf('poké')>=0: richEmbed.setAuthor(reward+' @ '+event.data.name,'https://i.imgur.com/arNZ21Y.png').setThumbnail('https://i.imgur.com/arNZ21Y.png'); break;
				case rn.indexOf('absol')>=0: richEmbed.setAuthor(reward+' Encounter @ '+event.data.name,'https://i.imgur.com/RD8MDuS.png').setThumbnail('https://i.imgur.com/RD8MDuS.png'); break;
				case rn.indexOf('dratini')>=0: richEmbed.setAuthor(reward+' Encounter @ '+event.data.name,'https://i.imgur.com/V4o18Wt.png').setThumbnail('https://i.imgur.com/V4o18Wt.png'); break;
				case rn.indexOf('chansey')>=0: richEmbed.setAuthor(reward+' Encounter @ '+event.data.name,'https://i.imgur.com/xM4ZiAZ.png').setThumbnail('https://i.imgur.com/xM4ZiAZ.png'); break;
				case rn.indexOf('larvitar')>=0: richEmbed.setAuthor(reward+' Encounter @ '+event.data.name,'https://i.imgur.com/EvWSM0F.png').setThumbnail('https://i.imgur.com/EvWSM0F.png'); break;
				default: richEmbed.setAuthor(reward+' Encounter @ '+event.data.name).setThumbnail(event.data.url);
			}
			return webhook_research.send(richEmbed).catch(console.error);
		case 'sightings':
			if(!webhook_pokemon){console.error('##### NO WEBHOOK FOR POKEMON HAS BEEN SET IN files/webhooks_config.json #####');return;}
			if(event.data.pokemon_id===null){return;}
			timeNow=new Date().getTime(); postTime=moment(timeNow).format('**h:mm A** MM/DD/YY');
			richEmbed=new Discord.RichEmbed().setThumbnail(pokemonIcon+event.data.pokemon_id+iconFileType)
			.setTitle('A wild **'+pokemonName[event.data.pokemon_id]+'** has appeared!')
			.setDescription('Spotted @ '+postTime+'\nSubmitted by '+event.data.submitted_by)
			.addField('Directions:','[Google Maps](https://www.google.com/maps?q='+event.data.lat+','+event.data.lon+') | [Apple Maps](http://maps.apple.com/maps?daddr='+event.data.lat+','+event.data.lon+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+event.data.lat+','+event.data.lon+'&navigate=yes)',false)
			.setImage('https://maps.googleapis.com/maps/api/staticmap?center='+event.data.lat+','+event.data.lon+'&markers='+event.data.lat+','+event.data.lon+'&size=450x220&zoom=16')
			.setFooter('Pokemon spawn for a max of 30 minutes. Despawn time will vary based on how quickly this was reported after spawn.');
			if(event.data.submitted_by){richEmbed.setDescription('Spotted @ '+postTime+'\nSubmitted by '+event.data.submitted_by);}
			else{richEmbed.setDescription('Spotted @ '+postTime);}
			return webhook_pokemon.send(richEmbed).catch(console.error);
		case 'nests':
			if(!webhook_nests){console.error('##### NO WEBHOOK FOR NESTS HAS BEEN SET IN files/webhooks_config.json #####');return;}
			if(event.data.pokemon_id<1){return;}
			migrationDate=config.MIGRATION_DATE*1000; timeNow=new Date().getTime();
			if(migrationDate<timeNow){ //CHECK AND RESET MIGRATION DATE IF NECESSARY
				config.MIGRATION_DATE=config.MIGRATION_DATE+1209600; migrationDate=config.MIGRATION_DATE;
				fs.writeFile("./files/config.json",JSON.stringify(config,null,4),"utf8",function(err){if(err)throw err;});
			}
			expireDate=moment(migrationDate).format('dddd, MMMM Do, h:mm A');
			richEmbed=new Discord.RichEmbed().setThumbnail(pokemonIcon+event.data.pokemon_id+iconFileType)
			.setTitle('A **'+pokemonName[event.data.pokemon_id]+'** Nest has been Reported!')
			.addField('Directions:','[Google Maps](https://www.google.com/maps?q='+event.data.lat+','+event.data.lon+') | [Apple Maps](http://maps.apple.com/maps?daddr='+event.data.lat+','+event.data.lon+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+event.data.lat+','+event.data.lon+'&navigate=yes)',false)
			.setImage('https://maps.googleapis.com/maps/api/staticmap?center='+event.data.lat+','+event.data.lon+'&markers='+event.data.lat+','+event.data.lon+'&size=450x220&zoom=16')
			.setFooter('This nest will expire on '+expireDate);
			if(event.data.submitted_by){richEmbed.setDescription('Submitted by '+event.data.submitted_by);}
			return webhook_nests.send(richEmbed).catch(console.error);
		default: return;
	}
});

pgClient.connect((err) => {
	if(err){ console.error('Connection Error', err.stack); }
	else{ console.log('Connected to your database.'); }
});

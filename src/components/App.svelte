<script>
	import Card from '../components/Card.svelte';
	import Tech from '../components/Tech.svelte';
	import PlanetCard from '../components/PlanetCard.svelte';

	let game, lobby, phases, corephases, actioncardphases, mounted = false, ws, cltName,
	jstr = JSON.stringify, jprs = JSON.parse, log = console.log;
	import { onMount,afterUpdate, beforeUpdate } from 'svelte';
	beforeUpdate(e=>{})
	afterUpdate(e=>{})
	onMount(f=>{
		corephases = [
			/*colonize:*/ {
				actn:[
					genActionPhase( "Choose between Settling or Colonizing a Planet", ["colonize"],
						wrappedOffer(["Colonize","Settle Colonies"]),
					),
					genActionPhase( "Choose an Unsettled Planet to Settle", ["colonize"],
						f=> offer(false,false,["unsettled_planets"],"subchoices",finish),
						["Settle Colonies"],
					),
					genActionPhase( "Settling your Planet", ["colonize"],
						f=> settle_colonies(getSubChoice(),getActPlyr()),
						["Settle Colonies"]
					),
					genActionPhase( "Choose an Unsettled Planet to Colonize", ["colonize"],
						f=> offer(false,false,["unsettled_planets"],"subchoices",finish),
						["Colonize"],
					),
					genActionPhase( "Colonizing your Planet", ["colonize"],
						f=> { colonize(getSubChoice(),getActPlyr().limbo,getActPlyr().limbo.filter(el => el.type == "colonize")[0]); finish(true);},
						["Colonize"],
					),
				],
				lead:[
					genLeadPhase( "Choose between Settling or Colonizing a Planet", ["colonize"],
						wrappedOffer(["Colonize","Settle Colonies"]),
						),
					genLeadPhase( "Choose an Unsettled Planet to Settle", ["colonize"],
						f=> offerUnsettled(),
						["Settle Colonies"],
						),
					genLeadPhase( "Settling your Planet", ["colonize"],
						f=> {settle_colonies(getSubChoice(), getActPlyr() ); finish(); },
						["Settle Colonies"],
						),
					genLeadPhase( "Choose an Unsettled Planet to Colonize", ["colonize"],
						f=> offerUnsettled(),
						["Colonize"],
						),
					genLeadPhase( "Colonizing your Planet", ["colonize"],
						f=> {
							if (getSubChoice().name == "Skip") finish();
							let planet = getSubChoice();
							if (planet.hosted_colonies.reduce( (acc, cur) => acc + cur.icons.colonize,0) >= planet.settle_cost)
								colonize( planet, getActPlyr().limbo,getActPlyr().limbo.filter(el => el.type == "colonize")[0]);
							finish(true);
						},
						["Colonize"],
						),
				],
				fllw:[
					genFollowPhase( "Choose between Settling or Colonizing a Planet", ["colonize"],
						f=> {
							if (0 == getActPlyr().permanents.filter(e => "bureaucracy" == e.type).length) {
								game.choices = [{name: "Colonize"}];
								finish(!0);
							} else simpleOffer(["Colonize","Settle Colonies"])
						},
					),
					genFollowPhase( "Choose an Unsettled Planet to Settle", ["colonize"],
						f=> offerUnsettled(),
						["Settle Colonies"],
					),
					genFollowPhase( "Settling your Planet", ["colonize"],
						f=> { settle_colonies(getSubChoice(), getActPlyr()); finish(!0);},
						["Settle Colonies"],
					), 
					genFollowPhase( "Choose an Unsettled Planet to Colonize", ["colonize"], 
						f=> offerUnsettled(),
						["Colonize"],
					),
					genFollowPhase( "Colonizing your Planet", ["colonize"],
						f=> {
							let planet = getSubChoices().find((planet)=>planet.hosted_colonies.reduce((acc, cur) => acc + cur.icons.colonize ) >= planet.settle_cost);
							colonize( planet, getActPlyr().limbo,getActPlyr().limbo.filter(el => el.type == "colonize")[0]);
							finish(true);
						},
						["Colonize"],
					),
				],
				clnp:[ ], 
			},
			/*/producetrade:/*/ {
				actn:[
					genActionPhase( "Choose between Producing or Trading Resources", ["producetrade"],
						wrappedOffer(["produce","trade" ]),
					),
					genActionPhase( "Choose a Planet to Produce Resources on", ["producetrade"],
						f=> offer( false, false , ["settled_&_conquered_planets"], "subchoices", finish ),
						["produce"],
					),
					genActionPhase( "Producing a Resource", ["producetrade"],
						f=> { produce(getSubChoices()); finish(true);},
						["produce"],
					),
					genActionPhase( "Choose a Planet to Trade Resources from", ["producetrade"],
						f=> offer( false, false, ["settled_&_conquered_planets"], "subchoices", finish),
						["trade"],
					),
					genActionPhase( "Trading a Resource", ["producetrade"],
						f=> {trade(getSubChoices(),getActPlyr()); finish();},
						["trade"],
					)
				],
				lead:[
					genLeadPhase( "Choose between Producing or Trading Resources", ["producetrade"],
						f=> offer( false , false , ["options",[{ name: "produce" }, { name: "trade" }]], "choices", finish ),
					),
					genLeadPhase( "Choose a Planet to Produce Resources on", ["producetrade"],
						f=> offer( true , true , [ "settled_&_conquered_planets" ], "subchoices", finish ),
						["produce"],
					),
					genLeadPhase( "Producing a Resource", ["producetrade"],
						f=> {
							getActPlyr().activerole = "produce";
							let prd = produce( getSubChoices(), getActPlyr().bstIcons.produce );
							if ( getActvActn() == "genetic_engineering" ) prd.forEach((plyr)=>plyr = [...plyr,{influence:[...plyr.influence,game.influence.pop()]}]);
							finish(true);
						},
						["produce"],
					),
					genLeadPhase( "Choose a Planet to Trade Resources from", ["producetrade"],
						f=> offer( true , true , [ "settled_&_conquered_planets" ],"subchoices", finish ),
						["trade"],
					),
					genLeadPhase( "Trading a Resource", ["producetrade"],
						f=> {
							getActPlyr().activerole = "trade";
							let prd = trade(getSubChoices(),getActPlyr(),getActPlyr().bstIcons.trade );
							if (getActvActn() == "diverse_markets") {
								for (let i in prd) {
									if (prd[i] > 1) {getActPlyr().influence.push(game.influence.pop());
									}
								}
							}
							if (getActvActn() == "specialization" ) {
								for (let i in Array.from(prd[getActPlyr().specialization])) { //what on earth is this doing?
									getActPlyr().influence.push(game.influence.pop());
								}
							}
							finish(true);
						},
						["trade"],
					),
				],
				fllw:[
					genFollowPhase( "Choose a Planet to Produce Resources on", ["produce"],
						f=> offer(!0, !0, ["settled_&_conquered_planets"], "subchoices", finish),
					),
					genFollowPhase( "Producing a Resource", ["produce"],
						f=> {
							let e = game;
							getActPlyr().activerole = "produce";
							produce(e.subchoices, e.players[game.actPlyrIndx].bstIcons.produce); finish(!0)
						},
					),
					genFollowPhase( "Choose a Planet to Trade Resources from", ["trade"],
						f=> offer(!0, !0, ["settled_&_conquered_planets"], "subchoices", finish),
					),
					genFollowPhase( "Trading a Resource", ["trade"],
						f=> {
							let e = game;
							getActPlyr().activerole = "trade";
							trade(e.subchoices, getActPlyr(), getActPlyr().bstIcons.trade);
							finish(!0)
						},
					),
				],
				clnp:[],
			},
			/*/politics:/*/ {
				actn:[ 
					genActionPhase(
						"Choose a Role Card to Replace Politics with",
						["politics"],
						f=> offer(false, false, ["rolecards"], "choices", finish ),
					),
					genActionPhase(
						"Swapping the Role Card for your Politics Card",
						["politics"],
						f=> {politics(getActPlyr().limbo.filter(el => el.type == "politics")[0], getChoices()[0], getActPlyr() ); finish(true);},
					),
				],
				lead:[],
				fllw:[],
				clnp:[],
			},
			/*/research:/*/ {
				actn:[
					genActionPhase( "Choose up to 2 Cards from your Hand to Remove from the Game", ["research"],
						f=> offer( false, true,["hand"], "choices", finish),
					),
					genActionPhase( "Removing your Cards from the Game", ["research"],
						f=> {research(getChoices(),getActPlyr()); finish(true);},
					),
				],
				lead:[
					genLeadPhase( "Choose a Technology to Research", ["research"],
						f=> offer( true , false , ["research" ], "choices", finish   ),
					), 
					genLeadPhase( "Researching your Technology", ["research"],
						f=> {
							if (getChoice() == "Skip") {finish(true);return;}
							let card = getChoices()[0];
							let p = { advanced: 0, metallic: 0, fertile: 0 };
							[...getActPlyr().settled_planets, ...getActPlyr().conquered_planets].map(el => p[el.type]++);
							let condition = Object.values(card.planet_requirements).reduce((acc,cur,i)=>(acc) ? cur > p[Object.keys(p)[i]] : acc,true)
							if ( condition && getActPlyr().bstIcons.research >= card.research_cost ) 
								play(game.research_deck, (card.is_permanent) ?  getActPlyr().permanents : getActPlyr().limbo, (card.is_permanent) ? "" : "discard", card.id);
							finish(true);
						},
					),
				],
				fllw:[
					genFollowPhase( "Choose a Technology to Research", ["research"],
						f=> offer(!0, !1, ["research"], "choices", finish),
					),
					genFollowPhase( "Researching your Technology", ["survey"],
						f=> {
							let e = game;
							if ("Skip" != e.choices[0].name) {
								let a = { advanced: 0, metallic: 0, fertile: 0 };
								[...e.players[game.actPlyrIndx].settled_planets, ...e.players[game.actPlyrIndx].conquered_planets].map(e => {
									a[e.type]++
								});
								let p = !0;
								for (let i in e.choices[0].planet_requirements) e.choices[0].planet_requirements[i] > a[i] && (p = !1);
								p && e.players[game.actPlyrIndx].bstIcons.research >= e.choices[0].research_cost && play(e.research_deck, e.players[game.actPlyrIndx].limbo, "discard", e.choices[0].id)
							}
							finish(!0);
						},
					),
				],
				clnp:[ ],
			},
			/*/survey:/*/ {
				actn:[        
					genActionPhase( "Surveying your Empire", ["survey"],
						f=> {survey(getActPlyr()); finish(true);},
					),
				],
				lead:[
					genLeadPhase(
						"Choose a Planet from your Galaxy to Explore",
						["survey"],
						f=> {
							for ( let i = 0; i < getActPlyr().bstIcons.survey; i++ ) {
								explore_planet( getActPlyr() );
							}
							offer( true , false , [ "options", game.options ], "choices",finish   );
						}
					),
					genLeadPhase(
						"Surveying your Empire",
						["survey"],
						f=> {
							if (getChoice() == "Skip") finish();
							catalog_planet( getActPlyr() );
							finish(true);
						},
					),
				],
				fllw:[
					genFollowPhase(
						"Choose a Planet from your Galaxy to Explore",
						["survey"],
						f=> {
							let e = game;
							for (let a = 0; a < e.players[game.actPlyrIndx].bstIcons.survey - 1; a++) explore_planet(e.players[game.actPlyrIndx]);
							offer(!0, !1, ["options"], "choices", finish)
						},
					),
					genFollowPhase(
						"Surveying your Empire",
						["survey"], 
						f=> { if (getChoice() == "Skip") finish(); catalog_planet(game.players[game.actPlyrIndx]); finish(!0)},
					),
				],
				clnp:[
					{"":
					f=>{}},
				],
			},
			/*/warfare:/*/ {
				actn:[
					genActionPhase(
						"Choose between Collecting a Starfighter or Conquering a Planet",
						["warfare"],
						wrappedOffer(["Conquer a Planet", "Collect a Starfighter"]),
					),
					genActionPhase(
						"Adding a Starfighter to your Fleet",
						["warfare"],
						f=> {warfare(getActPlyr()); finish(true);},
						["Collect a Starfighter"],
					),
					genActionPhase(
						"Choose a Planet to Conquer",
						["warfare"],
						f=> offer(false, false, ["unsettled_planets"], "subchoices", finish),
						["Conquer a Planet"],
					),
					genActionPhase(
						"Conquering your planet",
						["warfare"],
						f=> {conquer(getSubChoice(),getActPlyr()); finish(true);},
						["Conquer a Planet"],
					),
				],
				lead:[
					genLeadPhase( "Choose between Collecting Starfighters or Conquering a Planet", ["warfare"],
						wrappedOffer(["Conquer a Planet", "Collect Starfighters"]),
					),
					genLeadPhase( "Adding Starfighters to your Fleet", ["warfare"],
						f=> {
							range(1,getActPlyr().bstIcons.warfare).forEach( f=>warfare( getActPlyr() ) );
							finish(true);
						},
						["Collect Starfighters"],
					),
					genLeadPhase( "Choose a Planet to Conquer", ["warfare"],
						f=> offerUnsettled(),
						["Conquer a Planet"],
					),
					genLeadPhase( "Conquering your planet", ["warfare"],
						f=> {
							conquer(getSubChoice(), getActPlyr() );
							finish(true);
						},
						["Conquer a Planet"],
					),
				],
				fllw:[
					genFollowPhase(
						"Choose between Collecting Starfighters or Conquering a Planet",
						["warfare"],
						f=> {
							if (0 == game.players[game.actPlyrIndx].permanents.filter(e => "bureaucracy" == e.type).length) {
								let e = game;
								e.choices = [{
									name: "Collect Starfighters"
								}];  finish(!0);
							} else offer(!1, !1, ["options", [{
								name: "Conquer a Planet"
							}, {
								name: "Collect Starfighters"
							}]], "choices", finish);
						},
					),
					genFollowPhase(
						"Adding Starfighters to your Fleet",
						["warfare"],
						f=> {
							for (let e = 0; e < game.players[game.actPlyrIndx].bstIcons.warfare; e++) warfare(game.players[game.actPlyrIndx]);
							finish(!0)
						},
						["Collect Starfighters"],
					),
					genFollowPhase(
						"Choose a Planet to Conquer",
						["warfare"], 
						f=> offer(!1, !1, ["unsettled_planets"], "subchoices", finish),
						["Conquer a Planet"],
					),
					genFollowPhase(
						"Conquering your planet",
						["warfare"], 
						f=> {conquer(game.subchoices[0], game.players[game.actPlyrIndx]); finish(!0);},
						["Conquer a Planet"],
					),
				],
				clnp:[
					{"":
					f=>{}},
				],
			},
		];
		actioncardphases = [
			// #######################################################################################################################################################################################
			// improved_colonize 
			genActionPhase(
				"Choose wether or not to Settle a Planet",
				["improved_colonize"],
				f=> offer( true, false, [ "options", [{ name: "settle" }, { name: "Skip" }]], "choices", finish)
			),
			genActionPhase(
				"Choose a Planet to Settle",
				["improved_colonize"],
				f=> offerUnsettled(),
				["settle"],
				),
			genActionPhase(
				"Settling your Planet",
				["improved_colonize"],
				f=> { settle_colonies(getSubChoice(),getActvPlyr()); finish(true);},
				["settle"],
				),
			genActionPhase(
				"Choose between Settling or Colonizing a Planet",
				["improved_colonize"],
				wrappedOffer(["Colonize" ,"Settle Colonies"]),
				),
			genActionPhase(
				"Choose an Unsettled Planet to Settle",
				["improved_colonize"],
				f=> offerUnsettled(),
				["Settle Colonies"],
				),
			genActionPhase(
				"Settling your Planet",
				["improved_colonize"],
				f=> { settle_colonies( getSubChoice(), getActPlyr()); finish(true);},
				["Settle Colonies"],
				),
			genActionPhase(
				"Choose an Unsettled Planet to Colonize",
				["improved_colonize"],
				f=> offerUnsettled(),
				["Colonize"],
				),
			genActionPhase(
				"Colonizing your Planet",
				["improved_colonize"],
				f=> { colonize( getSubChoice(), getActPlyr().limbo, getActPlyr().limbo.filter(el => el.type == "improved_colonize")[0]); finish(true);},
				["Colonize"],
				),
			// #######################################################################################################################################################################################
			// improved_produce : 4
			genActionPhase(
				"Choose an empty Production Zone to Produce in",
				["improved_production"],
				f=> offer( true, false, ["settled_&_conquered_planets"], "choices" , finish),
				),
			genActionPhase(
				"Producing your Resource",
				["improved_production"],
				f=> { 
					if (getChoice() == "Skip") finish(); produce(game.choices); finish(true);},
				),
			genActionPhase(
				"Choose an empty Production Zone to Produce in",
				["improved_production"],
				f=> offer(true, false, ["settled_&_conquered_planets"], "choices", finish),
				),
			genActionPhase(
				"Producing your Resource",
				["improved_production"],
				f=> { if (getChoice() == "Skip") finish();produce(game.choices); finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_trade : 1
			genActionPhase(
				"Trading your Stocks and Bonds",
				["improved_trade"],
				f=> {
					game.players[game.actPlyrIndx].influence.push( game.influence.pop() );
					finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_research : 2
			genActionPhase(
				"Choose up to 3 Cards from your Hand to Remove from the Game",
				["improved_research"],
				f=> {
					draw(getActPlyr());
					offer(false, true, ["hand"], "choices", finish);}
				),
			genActionPhase(
				"Removing your Cards from the Game",
				["improved_research"],
				f=> {research(getChoices(), getActPlyr(), 3); finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_survey : 1
			genActionPhase(
				"Drawing your Cards",
				["improved_survey"],
				f=> {
					draw( getActPlyr() ); draw( getActPlyr() ); draw( getActPlyr() ); finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_warfare : 4
			genActionPhase(
				"Choose between Collecting a Starfighter or Conquering a Planet",
				["improved_warfare"],
				wrappedOffer("Conquer a Planet","Collect a Starfighter"),
				),
			genActionPhase(
				"Adding a Starfighter to your Fleet",
				["improved_warfare"],
				f=> {warfare(getActPlyr()); warfare(getActPlyr()); finish(true);},
				["Collect a Starfighter"]
				),
			genActionPhase(
				"Choose a Planet to Conquer",
				["improved_warfare"],
				f=> offerUnsettled(),
				["Conquer a Planet"]
				),
			genActionPhase(
				"Conquering your planet",
				["improved_warfare"],
				f=> { conquer(getSubChoice(),getActPlyr()); finish(true);},
				["Conquer a Planet"]
				),
			// #######################################################################################################################################################################################
			// mobilization : 4
			genActionPhase(
				"Collecting your Star Fighters",
				["mobilization"],
				f=> { warfare(getActPlyr()); warfare(getActPlyr()); finish(true);},
				),

			// #######################################################################################################################################################################################
			// survey_team : 1
			genActionPhase(
				"Adding Top Card of the Planet deck to your Empire",
				["survey_team"],
				f=> {
					let { game: game, game: { acting_player: player, planet_deck: planet_deck } } = get();
					player = game.players[game.actPlyrIndx];
					let planet = planet_deck.pop();
					player.unsettled_planets.push(planet);
					finish(true);},
				),
			// #######################################################################################################################################################################################
			// war_path : 4
			genActionPhase(
				"Choose a Planet to Conquer",
				["war_path"],
				f=> offerUnsettled(),
				),
			genActionPhase(
				"Conquering your planet",
				["war_path"],
				f=> { if (getChoice() == "Skip") finish(); conquer(getChoice(),getActPlyr()); finish(true);},
				),
			genActionPhase(
				"Choose a Planet to Conquer",
				["war_path"],
				f=> offerUnsettled(),
				),
			genActionPhase(
				"Conquering your planet",
				["war_path"],
				f=> { if (getChoice() == "Skip") finish(); conquer(getChoice(),getActPlyr()); finish(true);},
				),
			// #######################################################################################################################################################################################
			// terraforming : 2
			genActionPhase(
				"Choose an Unsettled Planet to Terraform",
				["terraforming"],
				f=> offerUnsettled()
				),
			genActionPhase(
				"Terraforming your Planet",
				["terraforming"],
				f=> {
					colonize( getChoice(), getActPlyr().limbo, getActPlyr().limbo.filter(el => el.type == "terraforming")[0]);
					if (getChoice().hosted_colonies.length > 0) {
						let c = getChoice().hosted_colonies.reduce((acc, cur) => acc + cur.icons.colonize,0);
						if (c >= getChoice().settle_cost) settle_colonies(getChoice(),getActPlyr()); }
					finish(true); },
				["Colonize"]
			),
			// #######################################################################################################################################################################################
			// genetic_engineering :1
			// UNIMPLIMENTED
			genActionPhase(
				"Engineering Genetics",
				["genetic_engineering"],
				finish,
				),
			// #######################################################################################################################################################################################
			// artificial_intelligence : 4
			genActionPhase(
				"Select a Role Card to take into your Hand",
				["artificial_intelligence"],
				f=> offer( false,  false, ["rolecards"], "choices", finish)
				),
			genActionPhase(
				"Adding Role Card to your Machine Learning Model",
				["artificial_intelligence"],
				f=> {
					let { game: game, game: { acting_player: player } } = get();
					player = game.players[game.actPlyrIndx];
					if (game.stacks.pilecount[game.choices[0].type] >= 1) {
						player.hand.push(
							Object.assign(
							{ id: gen_unique_id() },
							game.stacks.rolecards[game.stacks[game.choices[0].type]]
							)
						);
						game.stacks.pilecount[game.choices[0].type]--;
					}
					
					finish(true);
				},
				),
			genActionPhase(
				"Select a Role Card to take into your Hand",
				["artificial_intelligence"],
				f=> offer( false,  false, [ "rolecards" ], "choices", finish)
				),
			genActionPhase(
				"Adding Role Card to your Machine Learning Model",
				["artificial_intelligence"],
				f=> {
					let { game: game, game: { acting_player: player } } = get();
					player = game.players[game.actPlyrIndx];
					if (game.stacks.pilecount[game.choices[0].type] >= 1) {
						player.hand.push(
							Object.assign(
							{ id: gen_unique_id() },
							game.stacks.rolecards[game.stacks[game.choices[0].type]]
							)
						);
						game.stacks.pilecount[game.choices[0].type]--;
					}
					
					finish(true);
				}, 
				),
			// #######################################################################################################################################################################################
			// diverse_markets : 1
			// UNIMPLIMENTED
			genActionPhase(
				"Diversifying Markets",
				["diverse_markets"],
				finish
				),
			// #######################################################################################################################################################################################
			// specialization : 2
			genActionPhase(
				"Choose a Resource to Specialize in",
				["specialization"],
				wrappedOffer("red","blue","gren","purple")
				),
			genActionPhase(
				"Specializaing in your Seleted Resource",
				["specialization"],
				f=> { getActPlyr().specialization = getChoice(); finish(true);},
				),
			// #######################################################################################################################################################################################
			// data_network : 3
			genActionPhase(
				"Drawing Your Cards",
				["data_network"],
				f=> { draw(getActPlyr()); draw(getActPlyr()); finish(true);},
				),
			genActionPhase(
				"Choose any number of Cards from your Hand to Remove from the Game",
				["data_network"],
				f=> offer( true, true, [ "hand" ], "choices", finish),
				),
			genActionPhase(
				"Removing the Selected Cards from the Game",
				["data_network"],
				f=> {
					if (getChoice() == "Skip") finish();
					let { game: game, game: { choices: choices, acting_player: player } } = get();
					player = game.players[game.actPlyrIndx];
					research(choices, player, choices.length); finish(true);},
			)
		];
		let nonce = 0;
		game = {
			minPlyrs: 2,
			maaxPlyrs: 4,
			passtoplayer: false,
			nonce: 0,
			zone: "",
			skip: false,
			dragged: null,
			alwMulti: false,
			center_or_research: true,
			center_or_planets: true, //true = center, false = planets
			choicelabel: "choices",
			subchoices: [],
			influence: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			msgtoplayer: ['Waiting for other players to join'],
			options: [],
			planet_deck: [],
			curPhs: -4,
			leadPlyrIndx: 0,
			actPlyrIndx: 0,
			number_of_players: 2,
			started: false,
			gamephases: [
				{
				start: [
					{
					"set active player": f=> {
						if (game.started) {
						game.started = true;
						game.passt = false;
						game.leadPlyrIndx =
							(game.leadPlyrIndx + 1) % game.number_of_players;
						game.actPlyrIndx = game.leadPlyrIndx;
						game.leadingplayer = game.players[game.leadPlyrIndx];
						game.acting_player = game.players[game.leadPlyrIndx];
						openFullscreen();
						}
						if (game.leadingplayer !== undefined) {
						game.players[game.leadPlyrIndx].rounds++;
						}
						let planets = [
						...game.players[game.leadPlyrIndx].settled_planets,
						...game.players[game.leadPlyrIndx].conquered_planets
						];
						for (let p in planets) {
						tallyIcons(game.players[game.leadPlyrIndx],planets[p]);
						}
						for (let p in game.players[game.leadPlyrIndx].permanents) {
						tallyIcons(game.players[game.leadPlyrIndx],permanents[p]);
						}
						finish(true);
					}
					},
					{
					Productivity: f=> {
						if ( getActPlyr().permanents.filter(el => el.type == "productivity").length != 0 ) {
						getActPlyr().actionrolesequence = "aar";
						}
						finish();
					}
					},
					{
					"Choose an Order to Perform Your Action and Role Phases": f=> {
						if (getActPlyr().permanents.filter(el => el.type == "logistics" ).length != 0 ) {
						let options = [
							"Action Phase then Role Phase",
							"Role Phase then Action Phase"
						];
						if (getActPlyr().permanents.filter(el => el.type == "productivity").length != 0 ) {
							//add aar,ara,and raa as options
							options.push("Action Phase then another Action Phase then Role Phase");
							options.push("Action Phase then Role Phase then another Action Phase");
							options.push("Role Phase then Action Phase then another Action Phase");
						}
						//offer ar or ra
						simpleOffer(options)
						} else {
						finish();
						}
					}
					},
					{
					Logistics: f=> {
						if (getActPlyr().permanents.filter(el => el.type == "logistics").length != 0 ) {
						if (getChoice() == "Action Phase then Role Phase" ) {
							getActPlyr().actionrolesequence = "ar";
						} else if ( getChoice() == "Role Phase then Action Phase" ) {
							getActPlyr().actionrolesequence = "ra";
						} else if ( getChoice() == "Action Phase then another Action Phase then Role Phase" ) {
							getActPlyr().actionrolesequence = "aar";
						} else if ( getChoice() == "Action Phase then Role Phase then another Action Phase" ) {
							getActPlyr().actionrolesequence = "ara";
						} else if ( getChoice() == "Role Phase then Action Phase then another Action Phase" ) {
							getActPlyr().actionrolesequence = "raa";
						}
						finish(true);
						} else {
						finish();
						}
					}
					}
				]
				},
				{
				action: [
					{
						"Choose an Action to Play": f=> {
						offer( true, false, [ "hand" ], "choices", finish );
						}
					},
					{
						"Playing your Action": f=> {
						if (getChoice() == "Skip") {
							finish();
						} else {
							let card = getChoices()[0], plyr = getActPlyr();
							plyr.activeaction = card.type;
							handToLimbo(plyr,card);
							finish(true)
						}
						}
					},
					...getActionCorePhases(),
					...getActionCardPhases()
					]
				},
				{
				role: [
					{
					"Choose a Role Card to Lead with": f=> {
						offer( false , false, [ "rolecards" ], "choices", finish );
					}
					},
					{
					"Performing your Role": f=> {
						let card = getChoices()[0];
						if (game.stacks.pilecount[card.type] >= 1) {
							if (card.type=="producetrade"){
								getActPlyr().bstIcons[ "produce" ]++;
								getActPlyr().bstIcons[ "trade" ]++;
							} else {
								getActPlyr().bstIcons[ card.type ]++;
							}
							let newcard = Object.assign(
								{
								id: gen_unique_id(),
								finDest: "discard",
								selected: true
								},
								game.stacks.rolecards[game.stacks[card.type]]
							);
							getActPlyr().limbo = [ ...getActPlyr().limbo, newcard];
							game.stacks.pilecount[card.type]--;
						} else if (card.type != "colonize") {
							getActPlyr().bstIcons[ card.type ]++;
						}
						getActPlyr().activerole = card.type;
						finish(true);
					}
					}
				]
				},
				{
				lead: [
					{
						"Choose cards from your hand to Boost the effectiveness of your Role": f=> {
							offer( true , true, [ "hand" ], "choices", finish );
						}
					},
					{
						"Boosting your Role": f=> {
							if (getChoice() == "Skip") {
								finish();
							} else {
								getChoices().forEach( (card) => {
									boostWithIcons(getActPlyr(),card);
									card.finDest='discard';
								});
								//TODO: tally up icons on planets
								//TODO: tally up icons on technologies
								finish(true);
							}
						}
					},
					...getLeadCorePhases(),
					{
					"Pass the device to the Next Player": f=> {
						game.zone = "";
						game.passp = true;
					}
					},
					{
					"You passed Priority": f=> {
						game.passp = false;
						finish(true);
					}
					}
				]
				},
				{
				follow: [
					{
					"Choose between Following or Dissent the Leading Role": f=> {
						simpleOffer(["dissent",getLeadPlyr().activerole]);
					}
					},
					{
					Dissenting: f=> {
						getActPlyr().activerole = getChoice();
						if ( getActPlyr().activerole != "dissent" ) {
						let card = getChoices()[0];
						if (game.stacks.pilecount[card.name] >= 1) {
							getActPlyr().bstIcons[ card.name ]++;
							let newcard = Object.assign(
							{
								id: gen_unique_id(),
								finDest: "discard",
								selected: true
							},
							game.stacks.rolecards[game.stacks[card.name]]
							);
							getActPlyr().limbo = [...getActPlyr().limbo, newcard];
							game.stacks.pilecount[card.name]--;
						} else if (card.name != "colonize") {
							boostWithIcons(getActPlyr(),card);
						}
						finish(true);
						} else {
						draw( getActPlyr() );
						if ( getActPlyr().permanents.filter(el => el.type == "dissension").length != 0 ) {
							draw( getActPlyr() );
						}
						finish(true);
						}
					}
					}, //will auto pass to next phase if follow has been selected
					{
					"Choose cards from your hand to Boost the effectiveness of your Role": f=> {
						if ( getActPlyr() .activerole == "dissent" ) {
							finish();
						} else {
							offer( true , true , [ "hand" ], "choices",finish   );
						}
					}
					},
					{
					"Boosting your Role": f=> {
						if ( getActPlyr().activerole == "dissent" ) {
							finish();
						} else {
						if (getChoice() == "Skip") {
							finish();
						} else {
							let cards = getChoices;
							for (let i in cards) {
								boostWithIcons(getActPlyr(),cards[i]);
							}
							//TODO: tally up icons on planets
							//TODO: tally up icons on technologies
							finish(true);
						}
						}
					}
					},
					...getFollowCorePhases(),
					{
					"Pass the device to the Next Player": f=> {
						game.zone = "";
						game.passp = true;
					}
					},
					{
					"You passed Priority": f=> {
						game.passp = false;
						finish(true);
					}
					}
				]
				},

				// discard : 2
				{
				discard: [
					{
					"Would you like to Mobilize against a Planet": f=> {
						if ( getActPlyr() .activeaction != "mobilization" ) {
						finish();
						} else {
						offer( true , false , [ "options", [{ name: "mobilize" }, { name: "skip" }] ], "choices",finish   );
						}
					}
					},
					{
					"Choose a Planet to Mobilize Against": f=> {
						if ( getActPlyr() .activeaction != "mobilization" ||  getChoice() != "mobilize" ) {
						finish();
						} else {
						offerUnsettled();
						}
					}
					},
					{
					"Mobalizing against your Planet": f=> {
						if ( getActPlyr().activeaction != "mobilization" ) {
						finish();
						} else {
						conquer(getSubChoice(), getActPlyr() );
						finish(true);
						}
					}
					},
					{
					"Would you like to Streamline Your Empire": f=> {
						if (getActPlyr().permanents.filter(el => el.type == "streamlining" ).length == 0
						) {
						finish();
						} else {
						offer( false , false , [ "options", [{ name: "Decline" }, { name: "Streamline Empire" }]  ], "choices",finish   );
						}
					}
					},
					{
					"Choose a Card from Your Hand to Remove from the Game": f=> {
						if ( getActPlyr().permanents.filter(el => el.type == "streamlining").length == 0 || getChoice() != "Streamline Empire"
						) {
						finish();
						} else {
						offer( true , false , [ "hand" ], "subchoices", finish );
						}
					}
					},
					{
					"Streamlining Your Empire": f=> {
						if ( getActPlyr().permanents.filter(el => el.type == "streamlining" ).length == 0 || getChoice() != "Streamline Empire" || getChoice() == "Skip" ) {
						finish();
						} else {
						research( getChoices(), getActPlyr(), 1 );
						}
					}
					},
					{
					"Would you like to Utilize Your Empire's Hyperefficiency": f=> {
						if ( getActPlyr().permanents.filter(el => el.type == "hyperefficiency" ).length == 0 ) {
						finish();
						} else {
						simpleOffer(["Decline", "Utilize Hyperefficiency" ]);
						}
					}
					},
					{
					"Choose a Card from Your Hand to Remove from the Game": f=> {
						if ( getActPlyr().permanents.filter(el => el.type == "hyperefficiency").length == 0 || getChoice() != "Utilize Hyperefficiency" ) {
						finish();
						} else {
						offer( true , true , [ "hand" ], "subchoices",finish );
						}
					}
					},
					{
					"Your Empire is Hyperefficient": f=> {
						if ( getActPlyr().permanents.filter(el => el.type == "hyperefficiency").length == 0 || getChoice() != "Utilize Hyperefficiency" || getChoice() == "Skip" ) {
						finish();
						} else {
						research( getChoices(), getActPlyr(), getChoices().length );
						}
					}
					},
					{
					"Choose any Cards you would like to Discard": f=> {
						offer( true , true, [ "hand" ], "choices", finish );
					}
					},
					{
					"Discarding your Selected Cards": f=> {
						if (getChoice() == "Skip") {
						finish();
						} else {
						getChoices().forEach((card) => {
							getActPlyr().discard = [...getActPlyr().discard,card];
							getActPlyr().limbo = getActPlyr().limbo.filter(c=>c.id!=card.id);
						});
						finish(true);
						}
					}
					}
				]
				},
				//cleanup : 1
				{
				cleanup: [
					{
					"Drawing up to your Hand Size": f=> {
						cleanup();
						let handsize = getActPlyr().handsize;
						for (let index in getActPlyr().settled_planets) {
						handsize += getActPlyr().settled_planets[index].handsize_modifier;
						}
						for (let index in getActPlyr().conquered_planets) {
						handsize += getActPlyr().conquered_planets[index].handsize_modifier;
						}
						let l = getActPlyr().hand.length;
						if (l < handsize) {
						draw( getActPlyr(), handsize - l );
						}
						game.players.forEach(resetIconBoost);
						if ( game.started && checkforendgame() && (game.players.reduce((t, p) => t + p.rounds, 0) % game.number_of_players) == 0 ) {
						totalinfluence();
						game.nextphase = endgame;
						}
						finish(true);
					}
					},
					{
					"Pass the device to the Next Player": f=> {
						game.zone = "";
						game.skip = false;
						game.alwMulti = false;
						game.passp = false;
						game.passt = true;
					}
					},
					{
					"You passed the Turn": f=> {
						game.passt = false;
						finish(true);
					}
					}
				]
				}
			],
			players: [],
			winner: false,
			stacks: {
				pilecount: { research: 20, producetrade: 16, colonize: 20, warfare: 16, survey: 20 },
				survey: 0, warfare: 1, colonize: 2, producetrade: 3, research: 4, //indexes
				rolecards: [
					genEmptyCard("survey","Survey",{survey:1}),
					genEmptyCard("warfare","Warfare",{warfare:1}),
					genEmptyCard("colonize","Colonize",{colonize:1}),
					genEmptyCard("producetrade","Produce / Trade",{ produce:1, trade:1}),
					genEmptyCard("research","Research",{research:1},{research_deck: []}),
				]
			}
		};
			let url = location.origin.replace(/^http/, "ws"); 
			lobby = {
				url: url,
				sets: ["Base Game"],
				number_of_players: [2, 3, 4],
				existinggames: []
			};
			game.nonce = nonce;
			mounted = true;
	})
	///////////////////////////////////////////////////////////////////////////////
	let  	clearOptions = f=> game.options = [],
			offerUnsettled = f=> offer( false,  false, ["unsettled_planets"], "subchoices", finish),
            getActionCardPhases = f=> actioncardphases,
            getActvActn = f=> getActPlyr().activeaction,
            getActvRole = f=> getActPlyr().activerole,
            getChoice = f=> game.choices[0].name,
            getChoices = f=> game.choices,
            getSubChoice = f=> getSubChoices()[0],
            getSubChoices = f=> game.subchoices,
            finish = (cond=false) => phasefinishfunction(cond),
            getActPlyr = f=> game.players[game.actPlyrIndx],
            getLeadPlyr = f=> game.players[game.leadPlyrIndx],
            simpleOffer = (choices) => offer( false, false, ["options", choices.reduce((acc,cur)=>[...acc,{name:cur}],[])], "choices", finish),
            wrappedOffer = (choices) => f=> simpleOffer(choices),
            getActionCorePhases = f=> corephases.reduce((acc,cur)=>[...acc,cur.actn],[]).reduce((acc,cur)=>[...acc,...cur],[]),
            getLeadCorePhases =   f=> corephases.reduce((acc,cur)=>[...acc,cur.lead],[]).reduce((acc,cur)=>[...acc,...cur],[]),
            getFollowCorePhases = f=> corephases.reduce((acc,cur)=>[...acc,cur.fllw],[]).reduce((acc,cur)=>[...acc,...cur],[]),
            genActionPhase = (name,actions,phase,choices=[],cond=false) => ({ [name] : f=>{ if ( actions.includes(getActvActn()) && (choices.length==0 || choices.includes(getChoice()))) { phase() } else { finish(cond) } }}),
            genLeadPhase   = (name,actions,phase,choices=[],cond=false) => ({ [name] : f=>{ if ( actions.includes(getActvRole()) && (choices.length==0 || choices.includes(getChoice()))) { phase() } else { finish(cond) } }}),
            genFollowPhase = (name,actions,phase,choices=[],cond=false) => ({ [name] : f=>{ if ( actions.includes(getActvRole()) && (choices.length==0 || choices.includes(getChoice()))) { phase() } else { finish(cond) } }}),
            genEmptyCard = (type, name, symbols, extras={}) => ({ type: type,selected: false, name: name, selected: false, icons: {...{ survey: 0, warfare: 0, colonize: 0, produce: 0, trade: 0, research: 1},...symbols},image: null, ...extras}),
            tallyIcons = (dest,src) => ["survey","warfare","trade","produce","research",/*"colonize"*/].forEach( icon => dest.icons[icon] += src.icons[icon] ),
            handToLimboWithLimboDuplicatePurge = (plyr,card) => { rmFromField("limbo",plyr,card); handToLimbo(plyr,card);},
            handToLimbo = (plyr,card) => {playToField("limbo",plyr,card,'discard'); rmFromField("hand",plyr,card);},
            limboToHand = (plyr,card) => {playToField("hand",plyr,card,''); rmFromField("limbo",plyr,card);},
            playToField = (fld,plyr,card,fDest) => plyr[fld] = [...plyr[fld], { ...card, finDest: fDest }],
            rmFromField = (fld,plyr,card) => plyr[fld] = plyr[fld].filter(el => card.id != el.id),
            boostWithIcons = (plyr, src) => Object.keys(src.icons).forEach((icon) => plyr.bstIcons[icon]+=src.icons[icon]),
            resetIconBoost = (plyr) => plyr.bstIcons = {survey: 0, warfare: 0, colonize: 0, produce: 0, trade: 0, research: 0 },
            resetSelection = (selected) => selected.forEach((s) => s.selected = false),
            offlineOrIsClientTurn = f=> (cltName == getActPlyr().name || !lobby.online),
            setChoice = (chc) => game[game.choicelabel] = chc,
            cleanOptions = f=> game.options=[],
            displayPlanets = f=> game.center_or_planets = false,
            displayCenter = f=> game.center_or_planets = true,
            clearChoices = f=> game[game.choicelabel] = [],
            setDisplayInfo = (zone,multiple,skippable,label) => game = {...game,...{zone:zone,alwMulti:multiple,skip:skippable,choicelabel:label}},
            getAllCards = (plyr) => [...plyr.deck,...plyr.discard, ...plyr.limbo, ...plyr.hand],
            isPlanet = p => p.type=='planet' || p.type=='fertile' || p.type=='metallic' || p.type=='advanced',
            chkForPerm = (perm) => getActPlyr().permanents.filter( (el)=>el.type==perm ).length != 0,
            range = (min,max) => (min <= max) ? [...range(min, max-1),max] : [],
            singleCllBck = (cllBck,e,func) => f=> {func(); document.removeEventListener(e,this); cllBck();},
            produceTradeHelper = (filled,planets,resources,func=f=>{}) => { let prd = {blue:0,green:0,purple:0,red:0}; planets.forEach((planet) =>  planet.production_zones.forEach((zone)=>{     if (!zone.filled && resources > 0) {         zone.filled = filled;         prd[zone.type]++;         resources--;         func()     }  }) );return prd;};
	
	let choosewrapper = (c,zone) => (game.zone == zone) && offlineOrIsClientTurn() && (game.alwMulti) ? multiplechoose(c) : choose([c]);
	let multiplechoose = (choice) => {
		if (offlineOrIsClientTurn()){		
			if ( !game[game.choicelabel].includes(choice) ) {
				setChoice([...game[game.choicelabel],choice]);
				choice.selected=true;
				if (!isPlanet(choice) && choice.name != 'Skip') handToLimbo(getActPlyr(),choice);
			}
			else {
				choice.selected=false;
				if (!isPlanet(choice) && choice.name != 'Skip'){
					setChoice(game[game.choicelabel].filter( (el)=> el.id != choice.id ));
					limboToHand(getActPlyr(),choice);
				}
			}
		}
	};
	let choose = (choices) => offlineOrIsClientTurn() && clearOptions() && resetSelection(choices) && setChoice(choices) && finish();
	let unchoose = (choice) => {
		if (offlineOrIsClientTurn()){
			if ( game[game.choicelabel].includes(choice) ) {
				choice.selected=false;
				setChoice( game[game.choicelabel].filter( (el) => el.id != choice.id ));
				limboToHand(getActPlyr(),choice);
			}
		}
	};
	let offer = (
		skippable /*option to skip | sets game.skip=boolean */,
		multiple /*allows multiple choices | sets game.alwMulti=boolean */, 
		[field_label, choices] /* available cards to choose from | game.zone={'hand|discard|options|planets|research|rolecards'}, sets choices=array if specified*/, 
		choice_label /* label for where the choice is stored | set with game[label]=*/,
		callback /*callback that handles the choice or finishes the phase*/, 
	) => {
		setDisplayInfo(field_label,multiple,skippable,choice_label);
		switch (field_label){
			case 'hand': choices = getActPlyr().hand; break;
			case 'research': choices = game.research_deck; break;
			case 'discard': choices = getActPlyr().discard; break;
			case 'planets': choices = game.planet_deck; break;
			case 'rolecards': choices = game.stacks.rolecards; displayCenter(); break;
			case 'unsettled_planets': choices = getActPlyr().unsettled_planets; displayPlanets(); break;
			case 'settled_planets': choices = getActPlyr().settled_planets; displayPlanets(); break;
			case 'conquered_planets': choices = getActPlyr().conquered_planets; displayPlanets(); break;
			case 'settled_&_conquered_planets': choices = [...getActPlyr().settled_planets, ...getActPlyr().conquered_planets]; displayPlanets(); break;
		}
		clearChoices();
		present_as_choice(choices);
		sendstate();

	};
	let discard = (source_array, destination_array, id) => {
		let toRemove = source_array.find(e=> id == e.id);
		destination_array = [...destination_array,toRemove];
		source_array = source_array.filter(e=> e.id != toRemove.id);
	};
	//draw deck->hand
	let totalinfluence = f=> {
		game.players.forEach((plyr) => {
			plyr.influence = plyr.influence.reduce((acc,cur) => acc + cur,0) + getAllCards(plyr).reduce((acc,cur) => acc + cur.influence);
		}) ;
	};
	let endgame = f=> {
		//display victor
		let scores = game.players.map(e => e.influence);
		let winner = '';
		let highest = scores[0];
		game.players.map(e=> { if ( highest < e.influence ) { winner = e.name; highest = e.influence; } } );
	};
	let checkforendgame = f=> {
		let depletedstacks = game.stacks.pilecount.reduce((acc,cur) => acc + (cur < 1) ? 1 : 0,0);
		let stacklimit = (game.number_of_players == 1 || game.number_of_players == 2) ? 1 : 2 ;
		return ( stacklimit <= depletedstacks || game.influence.length == 0);
	};
	let draw = (player, quantity=1) => {
		for ( let i = 0; i < quantity; i++){
			if ( player.deck.length == 0) {
				if (player.discard.length == 0) return player;
				player.deck = knuthshuffle([...player.discard]);
				player.discard = [];
			}
			player.hand = [...player.hand, player.deck.pop()];
			player.deck = player.deck;
		}
		return player;
	};
	let play = (source_array, destination_array, finDest, id) => {
		let toRemove = source_array.find(e=> id == e.id);
		destination_array = [...destination_array,{...toRemove,finDest:finDest}];
		source_array = source_array.filter(e=> e.id != toRemove.id);
	};
	let gen_research_card = (name) => {
		return {
			name:name,
			type:name,
			id:gen_unique_id(),
			icons:{'survey':0,'warfare':0,'colonize':0,'produce':0,'trade':0,'research':0},
			planet_requirements:{'advanced':0, 'metallic':0, 'fertile':0},
			research_cost:0,
			action:f=>{},
			is_permanent:false,
			is_doublesided:false,
			imgurl:"/images/",
			Influence_value:0,
			img:function(im){this.imgurl+=im;return this;},
			influence:function(inf){this.influence_value = inf ; return this;},
			metallic:function(met){this.planet_requirements.metallic = met ; return this;},
			advanced:function(adv){this.planet_requirements.advanced = adv; return this;},
			fertile:function(fer){this.planet_requirements.fertile = fer; return this;},
			research:function(res){this.research_cost = res; return this;},
			permanent:function(){this.is_permanent = true; return this;},
			doubleside:function(){this.is_doublesided = true; return this;},
			icons:function(icons){this.icons = Object.assign(this.icons, icons); return this;},
			improved_colonize:function(){this.research(3);this.imgurl+="improvedcolonize";return this;},
			improved_survey:  function(){this.research(3);this.imgurl+="improvedsurvey";return this;},
			improved_research:function(){this.research(3);this.imgurl+="improvedresearch";return this;},
			improved_warfare: function(){this.research(3);this.imgurl+="improvedwarfare";return this;},
			improved_production:function(){this.research(3);this.imgurl+="improvedproduction";return this;},
			improved_trade:  		function(){this.research(3);this.imgurl+="improvedtrade";return this;},
			surveyteam:			function(){return this.research(5).metallic(2).influence(2).icons({'survey':2}).img('surveyteam');},
			warpath:				function(){return this.research(5).metallic(2).influence(2).icons({'warfare':2}).img('warpath');},
			terraforming:			function(){return this.research(5).fertile(2).influence(2).icons({'colonize':2}).img('terraforming');},
			geneticengineering:	function(){return this.research(5).fertile(2).influence(2).icons({'produce':2}).img('geneticengineering');},
			artificialintelligence:	function(){return this.research(5).fertile(2).influence(2).icons({'colonize':1,'produce':1}).img('artificialintelligence');},
			diversemarkets:		function(){return this.research(5).advanced(2).influence(2).icons({'research':1,'trade':1}).img('diversemarkets');},
			specialization:			function(){return this.research(5).advanced(2).influence(2).icons({'trade':2}).img('specialization');},
			mobilization:			function(){return this.research(5).metallic(2).influence(2).icons({'survey':1,'warfare':1}).img('mobilization');},
			datanetwork:			function(){return this.research(5).advanced(2).influence(2).icons({'research':2}).img('datanetwork');},
			abundance:   			function(){this.research(5);this.imgurl+="abundance"; this.is_doublesided=true; this.is_permanent=true; return this.fertile(2).influence(2);},
			adaptability:		   	function(){this.research(7);this.imgurl+="adaptability"; this.is_doublesided=true; this.is_permanent=true; return this.advanced(3).influence(5);},
			bureaucracy:  			function(){this.research(7);this.imgurl+="bureaucracy"; this.is_doublesided=true; this.is_permanent=true; return this.fertile(3).influence(5);},
			dissension:				function(){return this.research(7).fertile(3).influence(5).permanent().doubleside().img('dissension');},
			hyperefficiency:		function(){return this.research(7).advanced(3).influence(5).permanent().doubleside().img('hyperefficiency');},
			imperialism:			function(){return this.research(5).metallic(2).influence(2).permanent().doubleside().img('imperialism').icons({'survey':1,'trade':1,'warfare':1,});},
			logistics:				function(){return this.research(7).metallic(3).influence(5).permanent().doubleside().img('logistics');},
			productivity:			function(){return this.research(7).metallic(3).influence(5).permanent().doubleside().img('productivity');},
			scorchedearthpolicy:	function(){return this.research(5).metallic(2).influence(2).permanent().doubleside().img('scorchedearthpolicy');},
			streamlining:			function(){return this.research(5).advanced(2).influence(2).permanent().doubleside().img('streamlining');},
			weaponsemporium:		function(){return this.research(5).advanced(2).influence(2).permanent().doubleside().img('weaponemporium');},
			fertilegrounds:			function(){return this.research(5).fertile(2).influence(2).permanent().doubleside().img('fertilegrounds').icons({'research':1,'colonize':1,'produce':1,});},
		}
	};
	let gen_research_deck = f=> {
		game.research_deck =[
			gen_research_card('improved_production').metallic(1).icons({'warfare':1,'produce':1}).improved_production().img("wp.png"),
			gen_research_card('improved_production').metallic(1).icons({'survey':1,'produce':1}).improved_production().img("sp.png"),
			gen_research_card('improved_trade')     .metallic(1).icons({'survey':1,'trade':1}).improved_trade().img("st.png"),
			gen_research_card('improved_trade')     .metallic(1).icons({'warfare':1,'trade':1}).improved_trade().img("wt.png"),
			gen_research_card('improved_research')  .metallic(1).icons({'warfare':1,'research':1}).improved_research().img("wr.png"),
			gen_research_card('improved_research')  .metallic(1).icons({'survey':1,'research':1}).improved_research().img("sr.png"),
			gen_research_card('improved_colonize')  .metallic(1).icons({'warfare':1,'colonize':1}).improved_colonize().img("wc.png"),
			gen_research_card('improved_colonize')  .metallic(1).icons({'survey':1,'colonize':1}).improved_colonize().img("sc.png"),
		
			gen_research_card('improved_warfare')   .fertile(1).icons({'produce':1,'warfare':1}).improved_warfare().img("pw.png"),
			gen_research_card('improved_warfare')   .fertile(1).icons({'colonize':1,'warfare':1}).improved_warfare().img("cw.png"),
			gen_research_card('improved_trade')     .fertile(1).icons({'produce':1,'trade':1}).improved_trade().img("pt.png"),
			gen_research_card('improved_trade')     .fertile(1).icons({'colonize':1,'trade':1}).improved_trade().img("ct.png"),
			gen_research_card('improved_research')  .fertile(1).icons({'produce':1,'research':1}).improved_research().img("pr.png"),
			gen_research_card('improved_research')  .fertile(1).icons({'colonize':1,'research':1}).improved_research().img("cr.png"),
			gen_research_card('improved_survey')    .fertile(1).icons({'produce':1,'survey':1}).improved_survey().img("ps.png"),
			gen_research_card('improved_survey')    .fertile(1).icons({'colonize':1,'survey':1}).improved_survey().img("cs.png"),
		
			gen_research_card('improved_production').advanced(1).icons({'research':1,'produce':1}).improved_production().img("rp.png"),
			gen_research_card('improved_production').advanced(1).icons({'trade':1,'produce':1}).improved_production().img("tp.png"),
			gen_research_card('improved_warfare')   .advanced(1).icons({'warfare':1,'trade':1}).improved_warfare().img("tw.png"),
			gen_research_card('improved_warfare')   .advanced(1).icons({'research':1,'warfare':1}).improved_warfare().img("rw.png"),
			gen_research_card('improved_colonize')  .advanced(1).icons({'colonize':1,'trade':1}).improved_colonize().img("tc.png"),
			gen_research_card('improved_colonize')  .advanced(1).icons({'research':1,'colonize':1}).improved_colonize().img("rc.png"),
			gen_research_card('improved_survey')    .advanced(1).icons({'trade':1,'survey':1}).improved_survey().img("ts.png"),
			gen_research_card('improved_survey')    .advanced(1).icons({'research':1,'survey':1}).improved_survey().img("rs.png"),

			gen_research_card('survey_team').surveyteam().img(".png"),
			gen_research_card('war_path').warpath().img(".png"),
			gen_research_card('terraforming').terraforming().img(".png"),
			gen_research_card('genetic_engineering').geneticengineering().img(".png"),
			gen_research_card('artificial_intelligence').artificialintelligence().img(".png"),
			gen_research_card('diverse_markets').diversemarkets().img(".png"),
			gen_research_card('specialization').specialization().img(".png"),
			gen_research_card('mobilization').	mobilization().img(".png"),
			gen_research_card('data_network').datanetwork().img(".png"),
			gen_research_card('abundance').abundance().img(".png"),
			gen_research_card('adaptability').adaptability().img(".png"),
			gen_research_card('bureaucracy').bureaucracy().img(".png"),
			gen_research_card('dissension').dissension().img(".png"),
			gen_research_card('hyperefficiency').hyperefficiency().img(".png"),
			gen_research_card('imperialism').imperialism().img(".png"),
			gen_research_card('logistics').logistics().img(".png"),
			gen_research_card('productivity').productivity().img(".png"),
			gen_research_card('scorched_earth_policy').scorchedearthpolicy().img(".png"),
			gen_research_card('streamlining').streamlining().img(".png"),
			gen_research_card('weapons_emporium').weaponsemporium().img(".png"),
			gen_research_card('fertile_grounds').fertilegrounds().img(".png"),

		];
	};
	let genplayer = (_id) => {
		let _player = {
			'id':_id,
			'actionrolesequence':'ar', //can be ar. ra, aar, ara, raa
			'specialization':'',
			'available':true,
			'rounds':0,
			'limbo': [],
			'deck' : knuthshuffle(gennewdeck()),
			'hand' : [],
			'permanents' : [] ,
			'discard' : [],
			'handsize':5,
			'activeaction' : null,
			'activerole' : '',
			'handsize' : 5,
			'bstIcons' : {'survey':0,'warfare':0,'colonize':0,'produce':0,'trade':0,'research':0},
			'unsettled_planets' : [game.stacks.startingplanets.pop()],
			'settled_planets' : [],
			'conquered_planets' : [],
			'starfighters' : {'small':0,'medium':0,'large':0},
			'combatvalue' : 0,
			'influence':[],
		};
		draw(_player,_player.handsize);
		game.players = [...game.players,_player];
	};
	let genplanet = (name_in) => {	
		return {
			id:gen_unique_id(),
			name:name_in,
			type:'planet',
			settle_cost:2,
			settled:false,
			conquer_cost:2,
			production_zones:[],
			influence_value:2,
			icons:{'survey':0,'warfare':0,'colonize':0,'produce':0,'trade':0,'research':0,},
			handsize_modifier:0,
			hosted_colonies:[],
			metallic:function(){this.type='metallic';return this;},
			advanced:function(){this.type='advanced';return this;},
			fertile:function(){this.type='fertile';return this;},
			icon:function(icon_name){this.icons[icon_name]++;return this;},
			handsize:function(modifier){this.handsize_modifier=modifier;return this;},
			influence:function(influence){this.influence_value = influence;return this;},
			settle:function(cost){this.settle_cost=cost;return this;},
			conquer:function(cost){this.conquer_cost=cost;return this;},
			zone:function(zone){this.production_zones.push({type:zone, filled:false});return this;},
		};
	};
	let genplanetdeck = f=> { 
		game.planet_deck = knuthshuffle([
			//fertile planets
			genplanet('MISHBURR ITO-A').fertile().settle(5).conquer(4).zone('food')              .influence(3).icon('produce')   ,
			genplanet('STYKU').fertile().settle(4).conquer(5).zone('water')               .influence(3).icon('colonize')  ,
			genplanet('ANGUS DUFFY').fertile().settle(3).conquer(6).zone('food').zone('water') .influence(3)                   ,
			genplanet('GERDLAND').fertile().settle(4).conquer(5).zone('water')               .influence(3).icon('produce')   ,
			genplanet('MIK-MIK').fertile().settle(5).conquer(4).zone('food')              .influence(3).icon('colonize')  ,
			genplanet('NELOS IV').fertile().settle(5).conquer(4).zone('food')              .influence(2)      .handsize(1) ,
			genplanet('SPIELBANY VI').fertile().settle(4).conquer(5).zone('water')               .influence(2)      .handsize(1) ,
			genplanet('NEW TEXAS').fertile().settle(3).conquer(6).zone('food').zone('water') .influence(2).icon('colonize')  ,
			genplanet('ARTIGAS GNS-111').fertile().settle(3).conquer(6).zone('food').zone('water') .influence(2).icon('produce')   ,
			//advanced planets
			genplanet('HANOJ - T').advanced().settle(5).conquer(4).influence(3).zone('silicon').icon('trade'),
			genplanet('OKNOW').advanced().settle(4).conquer(5).influence(2).zone('silicon')                              .handsize(1),
			genplanet('SROD AVEIN N2').advanced().settle(3).conquer(6).influence(4)                             .icon('research'),
			genplanet("RAL GAI'GAW").advanced().settle(4).conquer(5).influence(3).zone('silicon').icon('trade'),
			genplanet('ECHO ROSE').advanced().settle(5).conquer(4).influence(3).zone('silicon')              .icon('research'),
			genplanet('SHOLMICAN').advanced().settle(3).conquer(6).influence(4).zone('silicon'),
			genplanet('ZEPHAN').advanced().settle(3).conquer(6).influence(4)               .icon('trade'),
			genplanet('SIMA-07C').advanced().settle(5).conquer(4).influence(2).zone('silicon')                              .handsize(1),
			genplanet('LYTTLE').advanced().settle(4).conquer(5).influence(3).zone('silicon')              .icon('research'),
			//mettalic planets
			genplanet('KYRIE & JUNO').metallic().settle(3).conquer(6).influence(4)            .icon('survey'),
			genplanet('MARGHANNAH PRIME').metallic().settle(4).conquer(5).influence(3)                           .handsize(1),
			genplanet('TANKAHSHIN').metallic().settle(4).conquer(5).influence(3).zone('metallic').icon('warfare'),
			genplanet('VOSON').metallic().settle(4).conquer(5).influence(3).zone('metallic').icon('survey'),
			genplanet('PINK SONAR').metallic().settle(5).conquer(4).influence(3).zone('metallic').icon('survey'),
			genplanet("OVERLORD BETZEL'S DOMAIN").metallic().settle(3).conquer(6).influence(4)            .icon('warfare'),
			genplanet('8910 SPIELEN').metallic().settle(4).conquer(5).influence(2).zone('metallic')               .handsize(1),
			genplanet('IDROYOS').metallic().settle(3).conquer(6).influence(5),
			genplanet('ERKAM-W').metallic().settle(5).conquer(4).influence(3).zone('metallic').icon('warfare')
		]);
		game.stacks.startingplanets = knuthshuffle([
			genplanet('MESIA SEDNIM').fertile().settle(2).conquer(2).influence(2).zone('water'),
			genplanet('DRAWDE').fertile().settle(2).conquer(2).influence(2).zone('food'),
			genplanet('LIAGIBA').advanced().settle(2).conquer(2).influence(2).zone('silicon'),
			genplanet('POMERENE').advanced().settle(2).conquer(2).influence(2).zone('silicon'),
			genplanet('CHRISPEN').metallic().settle(2).conquer(2).influence(2).zone('metallic'),
			genplanet('PIEDRA SECA').metallic().settle(2).conquer(2).influence(2).zone('metallic'),
		])   
	};
	let cleanup = f=> {
		getActPlyr().limbo.forEach(card => {
			getActPlyr()[card.finDest] = [ ...getActPlyr()[card.finDest], card ];
		});
	};
	let purchase = (src, dest, finDest, id) => { // duplicate of discard & duplicate of play
		let toRemove = src.find(e=> id == e.id);
		dest = [...dest,{...toRemove,finDest:finDest}];
		src = src.filter(e=> e.id != toRemove.id);
	};
	let remove_from_game = (source_array, toRemove) => { //remove_from_game hand->exile\
		toRemove.finDest="exile";
		return source_array.filter(e=> e.id != toRemove.id);
	};
	let present_as_choice = (options) => game.options = options;
	let settle_colonies = (planet, plyr) => {
		let planets = [...plyr.settled_planets,...plyr.conquered_planets];
		let reduction = [...planets,...getLeadPlyr().permanents].reduce((acc,cur)=>acc+cur.icons.colonize,0);
		if (planet.settle_cost - reduction <= planet.hosted_colonies.length){
			if (chkForPerm('abundance') && planet.production_zones.length != 0){
				planet.production_zones = planet.production_zones.map((pz)=>{return {type:pz.type,filled:true};})
			}
			plyr.discard = [...plyr.discard, ...planet.hosted_colonies];
			planet.hosted_colonies = [];
			planet.settled = true;
			discard(plyr.unsettled_planets,plyr.settled_planets,planet.id);
		}
		
	};
	//pass_turn leadingplayer->nextplayer
	let pass_turn = f=> {
		if (!lobby.online || cltName == getActPlyr().name ){
			game.passt=false;
			game.actPlyrIndx = game.leadPlyrIndx = (game.leadPlyrIndx+1)%game.number_of_players;
			game.leadingplayer = game.players[game.leadPlyrIndx];
			game.acting_player = game.players[game.leadPlyrIndx];
			finish();
		}
	};
	//pass_priority actingplayer->nextplayer
	let pass_priority = f=> {
		if (offlineOrIsClientTurn()){
			game.passp=false;
			game.actPlyrIndx = (game.actPlyrIndx+1)%game.number_of_players;
			game.acting_player = getActPlyr();
			finish();
		}
	};
	//determine_number_of_players logic->options->choice->number_of_players
	let determine_number_of_players = (callback) => {
		document.addEventListener('choicemade',singleCllBck( callback, 'choicemade', f=> game.number_of_players = game.choices));
		present_as_choice(range( game.minPlyrs, game.maxPlyrs));
	};
	//produce poduction_pile->host
	let produce = (planets, resources=1) => produceTradeHelper(true,planets,resources);
	//trade host->production_pile, influence_pile->player_influence
	//let trade = (planets, player, resources=1) => produceTradeHelper(false,planets,resources,f=>player.influence.push(game.influence.pop()));
	let trade = (plnt,plyr,res)=>{
		let prd = { blue: 0, green: 0, purple: 0, red: 0  };
		if (res < 1) return prd;
		for (let i = 0; i < plnt.length; i++){
			for(let j = 0; j < plnt[i].production_zones.length; j++) {
				if ( res > 0 && plnt[i].production_zones[j].filled ) {
					if (game.influence.length != 1) game.influence = game.influence.slice(1);
					plnt[i].production_zones[j].filled = false;
					prd[plnt[i].production_zones[j].type]++;
					plyr.influence = [...plyr.influence, 1];
					res--;
				}
			}
		} return prd;
	};
	//politics hand->limbo->exile, stacks->hand
	let politics = (politics_card, card, player) => {
		politics_card.finDest="exile";
		if (game.stacks.pilecount[card.type] >= 1){
			player.hand = [...player.hand, {...game.stacks.rolecards[game.stacks[card.type]], 'id':gen_unique_id()}];
			game.stacks.pilecount[card.type]--;
		}
	};
	//research hand->exile
	let research = (cards, player, limit=2) => {
		for (let i = 0; (i < cards.length && i < limit); i++){
			getActPlyr().limbo =  remove_from_game(getActPlyr().limbo, cards[i]);
		}
	};
	//boost logic->player_icons
	let boost = (cards, plyr) => cards.forEach((card) => boostWithIcons(plyr,card));
	//survey deck->hand
	let survey = (player) => player = draw(player,2);
	//colonize hand/limbo->host
	let colonize = (planet, source_array, card, isRole=false) => {
		let l = (isRole) ? getActPlyr().bstIcons.colonize : 1;
		for (let i = 0; i < l; i++){
			let toRemove = source_array.find(e=> card.type == e.type && e.finDest!='exile');
			planet.hosted_colonies = [...planet.hosted_colonies,toRemove];
			source_array = source_array.filter((e,i) => e.id != toRemove.id);
		}
	};
	//warfare starship_pile->player_starship_pile
	let warfare = (player) => player.starfighters.small++;
	//conquer player_starship_pile->starship_pile, player_unconquered_planets->player_conquered_planets
	let conquer = (planet, player)=>{
		if (chkForPerm('scorched_earth_policy')){
				planet.production_zones = [];
				planet.conquer_cost -= 2;
				if (planet.conquer_cost < 0) {
					planet.conquer_cost = 0;
				}
			}
		if (player.starfighters.small >= planet.conquer_cost){
			if (chkForPerm('abundance')){
				if (planet.production_zones.length != 0){
					planet.production_zones = planet.production_zones.map((pz)=>{return {type:pz.type,filled:true};})
				}
			}
			player.starfighters.small -= planet.conquer_cost;
			planet = select_via_id(player.unsettled_planets, planet.id);
			planet.conquered=true;
			player.conquered_planets.push(planet);
		}
	};
	//offer_to_boost present_as_choice, choose, boost
	let offer_to_boost = (player) => {
		game.zone = 'hand';
		game.alwMulti = true;
		game.skip = true;
		present_as_choice(player.hand);
		document.addEventListener('choicemade',singleCllBck(f=>{},'choicemade',f=>boost(game.choices, player)));
	};
	let select_via_id = (source, id) => {
		let temp = source.find(p=>p.id==id);
		source = source.filter(p=>p.id!=id);
		return temp
	};
	let boostrolewithcards = (choices, callback=f=>{}) => {
		if (choices[0].name == 'Skip') return;
		choices.forEach((card)=>{
			boostWithIcons(getActPlyr(),card);
			play(getActPlyr().hand,getActPlyr().limbo,'discard',cards[i].id);
		});
		callback();
	};
	let gen_unique_id = f=> {
		game.nonce++;	
		return game.nonce;
	};
	let performleaderrole = (callback=f=>{}) => getActPlyr().activerole.role.role.leader(callback);
	let performfollowerrole = (callback=null) => {
		getActPlyr().activerole.set(game.players[game.leadPlyrIndx].activerole.role);
		getActPlyr().activerole.role.role.follower(callback);
	};
	let explore_planet = (player)=>{
		let planet = game.planet_deck.pop();
		player.limbo = [...player.limbo,{...planet,'finDest':'planetdeck'}];
		game.options = [...game.options,planet];
	};
	let catalog_planet = (player) => {
		game.choices[0].finDest = 'unsetttled';
		player.unsettled_planets = [...player.unsettled_planets,game.choices[0]];
		player.limbo = player.limbo.filter(p=>p.id!=game.choices[0].id);
		player.limbo.filter(card => card.finDest=='planetdeck').forEach(planet=> discard(player.limbo,game.planet_deck,planet.id))
	};
	let followcentercardrole = (choices, callback=null) => {
		let card = choices[0];
		getActPlyr().activerole.set(card);
		if (game.stacks.pilecount[card.type] >= 1){
			getActPlyr().bstIcons[card.type]++;
			getActPlyr().limbo.push(Object.assign({'id':gen_unique_id(), 'finDest':'discard'},game.stacks.rolecards[game.stacks[card.type]]));
			
			game.stacks.pilecount[card.type]--;
		}
		let [,,...arr] = arguments;
		callback(card,arr);
	};
	let discardcardsfromhand = (choices, callback=null) => {
		if(choices[0].name!="Skip"){
			choices.forEach(card=>discard(getActPlyr().hand, getActPlyr().discard, card.id));
		}
		let [,,...arr] = arguments;
		callback(choices,arr);
	};
	let phasefinishfunction = (send = false) => {
		game.curPhs = (game.curPhs + 1) % game.gamesequence.length; 
		let jsobj = game.gamesequence[game.curPhs];
		let nextphase,msg;
		for (let key in jsobj){
			msg = key
			nextphase=jsobj[key];
		}
		if (game.nextphase !== endgame){
			game.nextphase = nextphase;
			game.msgtoplayer.push(msg);
		}
		
		if (send) sendstate();
		game.nextphase();
	};
	let gengamesequence = f=> {
		let _gamesequence=[];
		_gamesequence = gshelper([...game.gamephases[0].start],_gamesequence);
		//ar. ra, aar, ara, raa
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, f=>{return getActPlyr().actionrolesequence=='aar'});
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, f=>{return getActPlyr().actionrolesequence=='aar' || getActPlyr().actionrolesequence=='ar'  });
		
		_gamesequence = gshelper([...game.gamephases[2].role],_gamesequence);
		_gamesequence = gshelper([...game.gamephases[3].lead],_gamesequence);
		for (let i = 1; i<game.number_of_players; i++){
			_gamesequence = gshelper([...game.gamephases[4].follow],_gamesequence);
		}
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, f=>{return getActPlyr().actionrolesequence=='raa' || getActPlyr().actionrolesequence=='ara'  });
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, f=>{return getActPlyr().actionrolesequence=='raa'});

		_gamesequence = gshelper([...game.gamephases[5].discard],_gamesequence);
		_gamesequence = gshelper([...game.gamephases[6].cleanup],_gamesequence);
		game.gamesequence = _gamesequence;
	};
	let gshelper = (source_array, destination_array, wrapperfunction=false) => {
		for (let i in source_array){
			if (wrapperfunction){
				let jsobj = source_array[i];
				let func,key;
				let item = {};
				for (key in jsobj){
					func=jsobj[key];
				}
				item[key] = f=>{
					if (wrapperfunction){
						func();
					} else {
						finish();
					}
				}
				destination_array.push(item);
			} else {
				destination_array.push(source_array[i]);
			}
		}
		return destination_array;
	};
	let gennewdeck = f=> {
		let deck =  [
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.survey]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.survey]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.warfare]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.producetrade]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.producetrade]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.colonize]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.colonize]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.research]),
			Object.assign({'id':gen_unique_id()}, game.stacks.rolecards[game.stacks.research]),
			{
				'id':gen_unique_id(),
				type : 'politics',
				'selected':false,
				action : (callback)=>{
					let callbackwrapper = f=>{ 	
						document.removeEventListener('choicemade',callbackwrapper);
						politics(getActPlyr().activeaction, game.choices[0], getActPlyr());
						callback();
					};	
					game.center_or_planets=true;
					game.zone='rolecards';
					game.alwMulti=false;
					game.skip=false;
					game.msgtoplayer.push('choose a card from the center row to add to your hand');
					document.addEventListener('choicemade',callbackwrapper);
					present_as_choice(game.stacks.rolecards);
				},
				role : null,
				icons : {'survey':0,'warfare':0,'colonize':0,'produce':0,'trade':0,'research':0,'politics':1},
				name : 'Politics',
				image : null
			}
		];
		return deck;
	};
	let phaseincrement = f=> game.curPhs++;
	let newgame = (number_of_players) => {
		lobby.online=true;
		initgame(number_of_players);
		initSocket(f=>ws.emit('message',jstr({'header':'newgame',game:game,sets:lobby.sets,number_of_players:game.players.length})));
		
	};
	let initSocket = (func) => {
		let ping = f=> { setTimeout( f=> { ws.emit('message',jstr({header:'ping'})); ping(); },2000); };
		ws = io();
		ws.on('connect',f=>{ log('connected');
			ws.on('id',(msg)=>{ log('id');
				log(jprs(msg));
				game = {...game,
					game_id:jprs(msg),
					hader:'',
					curPhs:game.curPhs+1};
				lobby = {...lobby,
					existinggames:[...lobby.existinggames, game],
					online:true};
				registerws();
			});
			ws.on('fetch',(msg)=>{ log('fetch');
				log(jprs(msg));
				game.curPhs = -1;
				lobby = {...lobby,
					existinggames: jprs(msg).map(el=>el.game).filter(g=>g.players.filter(ll=>ll.available).length > 0),
					online:true}
			});
			ws.on('enter',(msg)=>{ log('enter');
				log(jprs(msg));
				game = {...jprs(msg),phasse:game.phases,gamesequence:game.gamesequence};
				lobby = { ...lobby,
					online:true,
					player_id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
				};
			});
			
			ws.on('join',(msg)=>{ log('join');
				msg = jprs(msg);
				log(msg);
				game.players[msg.slot] = msg.player;
				log('available slots: ', game.players.reduce((acc,cur)=>acc + (cur.available) ? 1 : 0,0));
				if (game.players.reduce((acc,cur)=>acc + (cur.available) ? 1 : 0,0) == 0) finish();
			});
			ws.on('set',(msg)=>{ //log('set'); 
				log(jprs(msg));
				game = {...jprs(msg),phasse:game.phases,gamesequence:game.gamesequence};
			});
			func();
			ping();
		})
	}
	let fetchexistinggames = f=> initSocket(f=> ws.emit('message',jstr({'header':'fetchexisting'})));
	let enterexistinggame = (g) => {
		let slot = g.players.findIndex(p=>p.available);
		if (!lobby.init) initgame(g.number_of_players); 
		ws.emit('message',jstr({'header':'enterexisting',game_id:g.game_id,player_name:lobby.screename,slot:slot}));
	};
	let sendstate = f=> lobby.online && ws.emit('message',jstr({...game,'header':'set','sender':lobby.player_id}));
	let registerws = f=> ws.emit('message',jstr({...game,'header':'register','sender':lobby.player_id}));
	let initgame = (number_of_players) => {
		game.label = cltName;
		lobby.init=true;
		genplanetdeck();
		for (let i = 0; i < number_of_players; i++){
			genplayer(i);
		}
		gen_research_deck();
		gengamesequence();
		if (!lobby.online) {
			gen_game_id();
			gen_player_names();
		} 
	};
	let gen_player_names = f=> game.players.forEach((plyr,i)=>plyr.name = 'Player '+(i+1));
	let toggle_center_or_planets = f=> game.center_or_planets = !game.center_or_planets;
	let toggle_research = f=> game.center_or_research = !game.center_or_research;
	let togglepasstoplayer = f=> {
		game.passtoplayer = !game.passtoplayer;
		openFullscreen();
	};
	let class_gen = (zone, item) => (game.zone==zone) ? ((item.selected) ? "selected" : "selectable" )  : "bordered";
	
	let gen_game_id = f=> {
		game.game_id ='';
		game.game_id += Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
	};
	let knuthshuffle = (array) => {
		let currentIndex = array.length;
		let temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	};
	let drag = (evt,item) => f=> game.dragged=item;
	let drop = (evt,zone) => f=> {
		let el = document.getElementById('playedcards').getBoundingClientRect();
		if (evt.changedTouches[0].clientX > el.left
		&& evt.changedTouches[0].clientX < el.left+ el.width
		&& evt.changedTouches[0].clientY < el.top+el.height
		&& evt.changedTouches[0].clientY > el.top){
			if(game.dragged!==null) 
				choosewrapper(game.dragged,zone);
			game.dragged!=null;
		}
		let ll = document.querySelector('#dragged');
		ll.style.visibility="hidden";
	};
	let move = (evt, img) => f=> {
		let touch = evt.targetTouches[0];
		// Place element where the finger is
		let el = document.querySelector('#dragged');
		el.style.position = "absolute";
		el.style.visibility="visible";
		el.style.top = touch.pageY-75+'px';
		el.style.left = touch.pageX-50+'px';
		el.style.width = "100px";
		el.style.height = "137px";
		el.style.zIndex = "4";
		el.style.backgroundImage="url('"+img+"')";
	};
	let newoffline = f=> {
		lobby.online=false;
		game.curPhs = 0;
		initgame(2);
		finish();;
	};
	let openFullscreen = f=> {
		let elem = document.getElementById("screen");
		if (elem.requestFullscreen) {
		elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
		}
	};
	
</script>

<style>
	.show,.research,.stars,.centerrow,.playedcards,.ownedcards,.stars:before,.stars:after,.msgtoplayer,.options,.talloptions{
		position:absolute
	}
	.show{
		border-radius:0 50% 50% 0
	}
	.show,.research{
		top:20vh;
		height:25vh;
		width:25vh;
		background:#505050;
		display:flex;
		border:.5px solid #319eb1;
		z-index:2
	}
	.research{
		border-radius:50% 0 0 50%;
		right:0
	}
	.player{
		border-radius:5vh;
		background:#505050;
		display:flex
	}
	.stars{
		top:50%;
		left:50%;
		width:2px;
		height:2px;
		box-shadow:686px 466px #d4d4d4,630px 365px whitesmoke,1140px 224px #ededed,1048px 344px white,857px 70px #e3e3e3,651px 400px #dbdbdb,431px -107px #d1d1d1,-144px 151px #d4d4d4,139px 402px #f7f7f7,1090px -160px #c9c9c9,1489px 75px #d6d6d6,-404px -113px #e0e0e0,-94px -358px #fafafa,692px -211px #fcfcfc,1414px 403px #e3e3e3,445px -469px whitesmoke,437px -173px #cfcfcf,-1474px 79px #e8e8e8,286px -370px #e3e3e3,-389px -74px #f2f2f2,-386px 230px #cccccc,1289px -415px #f0f0f0,566px 6px #d1d1d1,645px 53px #f7f7f7,90px -232px #d4d4d4,868px 214px #dedede,633px -126px #c4c4c4,-1432px -324px #c4c4c4,486px -11px #f0f0f0,1484px 338px #f2f2f2,1496px -127px #e8e8e8,587px -446px #f0f0f0,695px -142px #e6e6e6,1145px 14px #f0f0f0,339px -36px #d4d4d4,193px -337px #ebebeb,-1364px -453px #ebebeb,287px -252px whitesmoke,888px 94px #fafafa,485px 148px #c4c4c4,-619px -26px #d6d6d6,-1016px -251px #c9c9c9,-369px -387px #e3e3e3,-87px -433px #f2f2f2,-128px 162px #ededed,285px 468px #cfcfcf,-715px -447px #cfcfcf,1124px -404px #d9d9d9,1209px 248px #e6e6e6,831px -459px #f7f7f7,-1320px 390px #fafafa,-416px 189px #ebebeb,-1445px -2px #d6d6d6,-765px -181px #e3e3e3,-217px -471px #ededed,1283px 76px #e6e6e6,-718px -474px #e0e0e0,198px -71px #dbdbdb,1009px -200px #f2f2f2,-1418px 200px #d4d4d4,1354px -349px #dedede,-934px 243px #cfcfcf,-116px 465px #e8e8e8,-314px 446px #c9c9c9,-338px -311px #dbdbdb,307px 92px #fcfcfc,-1414px 412px #c4c4c4,-1296px 472px #fcfcfc,-787px -76px #e0e0e0,-398px 466px #dbdbdb,-532px 144px #d6d6d6,-1449px -143px #c7c7c7,755px -101px #d9d9d9,222px 355px #dbdbdb,-1145px -318px #d4d4d4,355px -463px whitesmoke,-807px -336px white,-398px -471px #c4c4c4,-935px 152px #d4d4d4,1082px 166px #d1d1d1,456px -159px #dedede,-818px 270px #dbdbdb,63px 270px white,60px 3px #c9c9c9,560px 173px whitesmoke,1217px -292px #ebebeb,-913px -419px #c2c2c2,-790px -386px #e6e6e6,988px -472px #cfcfcf,-318px -476px #f2f2f2,-179px -282px #f7f7f7,1079px -27px #fafafa,-1179px -466px #cccccc,322px -193px #c7c7c7,-545px -269px #cccccc,-1188px 318px #e0e0e0,19px 227px #d9d9d9,-1141px -437px #d9d9d9,475px 86px #cfcfcf,93px 208px #fcfcfc,-734px -222px #fcfcfc,-487px 61px #ebebeb,1136px 107px #d6d6d6,211px -291px #ebebeb,-1003px 91px #c2c2c2,1379px 462px #e8e8e8,-85px -412px #e8e8e8,549px -129px #cfcfcf,-269px -428px #c4c4c4,-442px 281px #c2c2c2,-116px -186px #c2c2c2,-1092px 252px #e8e8e8,598px -47px #c4c4c4,599px 430px #e0e0e0,946px 225px #e3e3e3,994px -441px #c9c9c9,-265px 4px #d4d4d4,1376px -454px #d9d9d9,-963px -224px white,-202px -223px #cfcfcf,1005px -201px #e3e3e3,-659px -302px #f2f2f2,-325px 397px #c2c2c2,-44px -391px #c2c2c2,228px -223px #dedede,-603px 221px #dedede,-147px -397px #c9c9c9,75px -394px #d9d9d9,-308px 239px #f0f0f0,-807px -74px #dbdbdb,-857px -235px #f0f0f0,1055px 465px #d9d9d9,307px 252px #cccccc,-1249px 25px #d1d1d1,669px 304px #dbdbdb,-738px -341px #f0f0f0,-1063px -20px #ebebeb,-1476px -271px #e8e8e8,-20px -415px #cccccc,-1010px 338px #d4d4d4,-166px -3px #cfcfcf,129px 7px #e0e0e0,618px 10px #ededed,-1481px -273px #f2f2f2,-965px -193px #c4c4c4,1271px 431px #f2f2f2,991px -315px #c4c4c4,-918px 270px #d1d1d1,-1172px -216px #ebebeb,1483px 449px #dedede,728px 104px #e6e6e6,144px -366px white,-656px 42px #f2f2f2,-527px -371px #f7f7f7,76px 231px #d1d1d1,1073px -183px #ededed,520px 120px #e3e3e3,-163px 16px #cccccc,-1367px 82px #d6d6d6,-484px -131px whitesmoke,279px -435px #e8e8e8,446px -149px #e0e0e0,-735px 379px #ededed,-794px -442px #f2f2f2,1314px 452px #c2c2c2,-1146px -65px #d6d6d6,-6px -390px #fafafa,524px -183px #cccccc,641px -148px #e3e3e3,827px -341px #dedede,150px 150px #d4d4d4,-1206px 417px #cccccc,-86px -451px #d1d1d1,1144px -22px #e0e0e0,-336px -144px #c2c2c2,436px 173px #c2c2c2,506px -318px #fafafa,167px 90px #cccccc,128px 220px #ebebeb,-344px 424px #c2c2c2,609px 393px #fcfcfc,298px 211px #c2c2c2,-595px -339px #cccccc,1184px -338px #c7c7c7,-1149px 118px #dbdbdb,-891px 14px #ebebeb,107px -419px #d9d9d9,-233px -330px #f0f0f0,-1457px 443px #dedede,-217px 86px #d4d4d4,1142px 83px #c4c4c4,623px 309px #f7f7f7,503px -216px #e8e8e8,-989px -176px #ebebeb,-269px 291px #e3e3e3,483px 22px #fcfcfc,1290px 302px #cccccc,-1016px -273px #c7c7c7,-1426px -65px #e3e3e3,162px -341px #c7c7c7,-103px 335px #dbdbdb,944px -441px #e3e3e3,1151px 163px #e8e8e8,-1110px -42px #cfcfcf,-901px 15px #c4c4c4,179px 60px #dbdbdb,695px -320px #e3e3e3,-923px -348px white,1102px 373px #e0e0e0,-823px 154px whitesmoke,-695px 424px #f2f2f2,1421px -336px #d9d9d9,-947px -471px #fcfcfc,1267px -410px #fafafa,140px -470px #d1d1d1,-931px -476px #d4d4d4,650px -354px #c7c7c7,-838px -426px #dedede,810px 339px #d1d1d1,-1405px 343px #d9d9d9,183px -17px #e3e3e3,-1275px -237px #f2f2f2,-666px -74px white,-1155px 61px #e6e6e6,-1478px 48px #ebebeb,-146px 288px #f0f0f0,936px -277px #e3e3e3,770px 409px #d6d6d6,935px 443px #c4c4c4,-616px -408px #f0f0f0,-97px -268px #c9c9c9,-6px -292px white,10px 262px #ebebeb,791px 438px #f2f2f2,470px -34px #d6d6d6,679px -298px #d6d6d6,1271px -303px whitesmoke,480px 166px #e0e0e0,-502px -241px #d9d9d9,599px -435px #d1d1d1,1317px 176px #c2c2c2,1124px -126px #d6d6d6,17px -358px #c2c2c2,1364px 232px #cccccc,-1176px -248px #c2c2c2,1178px -175px white,84px -98px #c9c9c9,-494px 305px #cccccc,-464px 476px whitesmoke,269px -250px #e3e3e3,-381px 59px #e3e3e3,805px -247px #e8e8e8,103px -60px #d6d6d6,-1368px -210px #f0f0f0,304px 39px whitesmoke,1189px 457px #d9d9d9,-1171px 447px #ebebeb,-1447px -25px #f2f2f2,-507px -347px #f7f7f7,835px -473px #cfcfcf,544px 133px #cccccc,-254px 36px #c9c9c9,-134px 4px #d9d9d9,-727px -88px #ededed,200px 92px #f7f7f7,-1372px -93px #e6e6e6,-16px -17px #d1d1d1,707px -152px #cfcfcf,-442px 311px #c4c4c4,-77px 112px #ebebeb,-1488px 226px #c2c2c2,-1151px 431px white,1180px -95px #d6d6d6,-836px -263px #f2f2f2,-35px 327px #fafafa,1242px -238px #e8e8e8,-679px -273px #c4c4c4,296px 401px #cfcfcf,-724px 70px #f0f0f0,-1350px -171px #f0f0f0,53px 113px whitesmoke,1112px -207px #fafafa,276px -437px #d9d9d9,513px 429px whitesmoke,30px 343px #cccccc,60px 86px #dbdbdb,654px -157px #f2f2f2,970px 299px #cfcfcf,-1247px -264px #ebebeb,-697px 301px #c7c7c7,-205px 50px #ebebeb,-332px 192px #fcfcfc,1077px -374px #c9c9c9,-856px -449px #e6e6e6,313px 389px #fcfcfc,262px -378px #c7c7c7,-801px -206px #c7c7c7,-330px -8px #f7f7f7,284px 3px #cccccc,-1264px 478px #cccccc,1458px -160px whitesmoke,-906px -225px #dedede,503px -98px #c7c7c7,93px -84px #dedede,1201px -347px #f7f7f7,580px 265px #e0e0e0,1495px -157px whitesmoke,-100px -255px #e8e8e8,214px 462px #ebebeb,20px -185px #ededed,1134px -381px #ededed,-1263px 281px #ebebeb,-748px 113px #ebebeb,-1371px -137px whitesmoke,13px -13px #cfcfcf,1116px 101px #e6e6e6,-139px -410px #c7c7c7,258px -83px #c9c9c9,-1336px 351px #e6e6e6,502px 1px #e0e0e0,268px -269px #c2c2c2,-549px 50px #c9c9c9,1191px -363px #c7c7c7,-117px -271px #f2f2f2,287px 288px #dbdbdb,-78px -95px #fafafa,-567px 228px #cfcfcf,-911px -285px #c2c2c2,1242px -257px #fafafa,1304px 336px #ededed,-66px -117px #c4c4c4,-560px 198px #c9c9c9,-1229px -245px whitesmoke,-980px 144px #d1d1d1,-982px -453px #ebebeb,-1056px 272px #d4d4d4,-30px -247px #e8e8e8,-741px 456px #d6d6d6,-1467px 397px #f2f2f2,-1341px 134px #dbdbdb,1226px -408px #cfcfcf,995px 345px #c7c7c7,564px 167px #e6e6e6,-333px 33px #f7f7f7,-1198px 433px #ebebeb,1308px 356px #e3e3e3,997px 286px #d1d1d1,734px 213px #ebebeb,-1256px -173px whitesmoke,847px -200px #cfcfcf,-751px 429px #dedede;
		animation:fly 3s linear infinite;
		transform-style:preserve-3d
	}
	.stars:before,.stars:after{
		content:"";
		width:inherit;
		height:inherit;
		box-shadow:inherit
	}
	.stars:before{
		transform:translateZ(-300px)
	}
	.stars:after{
		transform:translateZ(-600px)
	}
	.stars:after,.stars:before{
		animation:fade2 3s linear infinite
	}
	@keyframes fly{
		from{
			transform:translateZ(0px)
		}
		to{
			transform:translateZ(300px)
		}
	}
	@keyframes fade1{
		from{
			opacity:.5
		}
		to{
			opacity:1
		}
	}
	@keyframes fade2{
		from{
			opacity:0
		}
		to{
			opacity:.5
		}
	}
	.pass{
		border-radius:1vh;
		height:50px;
		min-width:200px;
		background:#505050;
		display:flex
	}
	.msgtoplayer{
		text-align:center;
		background:#505050;
		border-radius:5vh;
		width:60%;
		margin-left:20%;
		top:75%
	}
	.selectable{
		border:solid #72d2df;
		border-width:1px
	}
	.selected{
		border:solid #32be84;
		border-width:1px
	}
	.flex{
		display:flex
	}
	.playerinfo{
		display:flex;
		width:100%;
		height:10%
	}
	.playingfield{
		overflow:hidden;
		min-height:100vh;
		min-width:100vw;
		background:radial-gradient(#523067,#0a0a0a);
		background-repeat:no-repeat;
		background-size:cover
	}
	.options,.talloptions{
		justify-content:center;
		display:flex;
		right:10%;
		top:55vh;
		width:80%;
		font-size:150%;
		border-radius:5vh;
	}
	.ownedcards{
		display:flex;
		height:20%;
		top:80%
	}
	.hand{
		margin:auto;
		display:flex;
		max-width:90%;
		max-height:100%;
		overflow-x:scroll;
		overflow-y:hidden
	}
	.deck,.discard{
		border-radius:3vh;
		min-width:19vh;
		max-width:19vh;
		background-repeat:no-repeat;
		text-align:center;
		display:flex;
		font-size:6vh
	}
	.deck{
		margin-right:auto;
		background-image:url(../images/card-draw.svg)
	}
	.discard{
		margin-left:auto;
		background-image:url(../images/card-burn.svg)
	}
	.zone{
		width:100%;
		overflow-x:scroll;
		overflow-y:hidden;
		display:flex
	}
	.centerrow{
		height:40%;
		top:15%
	}
	.researchrow{
		margin-top:15vh;
		height:40%;
		padding-left:50vh;
		width:60vw
	}
	.researchrow > div{
		height:95%
	}
	.playedcards{
		height:20%;
		overflow-x:scroll;
		top:55%
	}
	.bordered{
		border:1px solid #000
	}
	::-webkit-scrollbar{
		display:none
	}
	.playingfield > p,.playingfield > input{
		height:2em;
		text-align:center;
		width:100vw;
		font-size:8vh;
		background-color:#221a3b;
		border:none;
		color:#319eb1;
		padding:0;
		margin:0
	}
	.passtoplayer{
		height:80%;
		width:100%;
		top:10%;
		border:none;
		color:#fff;
		background-color:#221a3b
	}
</style>
<div id='dragged'></div>
<div class='stars'></div>
<div id="screen" class="bordered playingfield">
	{#if mounted}
		{#if game.passtoplayer && !lobby.online}
			<div class='passtoplayer' on:click={e=>togglepasstoplayer()}>
				pass to next player
			</div>
		{:else if game.winner}
			<div class='passtoplayer'> {game.winner} WON!!!! </div>
		{:else if game.curPhs<0}
			{#if game.curPhs==-4}
				<p> Enter your Name</p>	
				<input type="text" bind:value={cltName} on:keypress={e=>e.key=='Enter' && phaseincrement() }>
				<p on:click={phaseincrement}>Finished</p>
			{:else if game.curPhs==-3}
				<p on:click={phaseincrement}>Start a New Online Game</p>
				<p on:click={newoffline}>Start a New Offline Game</p>
				<p on:click={fetchexistinggames}>Join an Existing Online Game</p>
			{:else if game.curPhs==-2}
				<p> Choose your Game's number of Players</p>
				{#each [2,3,4] as i}
					<p on:click={e=> newgame(i)}>{i}</p>
				{/each}
			{:else if game.curPhs==-1}
				<p>Choose a Game to Join</p>
				{#each lobby.existinggames as g}
					<p on:click={e=>enterexistinggame(g)}>{g.label+"'s Game"}</p>
				{/each}
			{/if}
		{:else}
			{#each game.players as player}
				{#if game.players[game.actPlyrIndx]!==undefined && ((cltName==player.name && lobby.online) || (game.players[game.actPlyrIndx].id==player.id && !lobby.online)) }
					<div class="playerinfo">
						{#each game.players as p}
							<div style="width:{100/game.number_of_players}%" class="flex player {(game.players[game.actPlyrIndx] !== undefined && p.name == game.players[game.actPlyrIndx].name) ? 'selectable' : 'bordered'}">
								<div style="width:33%; text-align: center;"> Military Might {p.starfighters.small}</div>
								<div style="width:33%; text-align: center;"> Galactic Influence {p.influence.length}</div>
								<div style="width:33%; text-align: center;"> {p.name}</div>
							</div>
						{/each}
					</div>
					<!-- stacks / planets toggle -->
					<div class="show" on:click={toggle_center_or_planets}>
						show {(game.center_or_planets) ? "planets" : "center row"}
					</div>
					<div class="research" on:click={toggle_research}>
						show {(game.center_or_research) ? "research" : "center row"}
					</div>
					<!-- stacks -->
					{#if game.zone=='research' || !game.center_or_research}
						<div class="zone researchrow">
							{#each game.research_deck as card (card.id)}
								<Card on:click={f=>choosewrapper(card,'research')} selectable={(game.zone=='research')} {card}/>
							{/each}
						</div>
					{:else if game.center_or_planets}
						<div class="flex zone centerrow">
							{#each game.stacks.rolecards as card (card.name)}
								<Card {card} selectable={game.zone=='rolecards'} pilecount={game.stacks.pilecount[card.type]} on:click={f=>choosewrapper(card,'rolecards')} on:touchmove="{(event)=>move(event, '/images/'+card.type+'.png','rolecards')}" on:touchstart="{(event)=>drag(event,card,'rolecards')}" on:touchend="{(event)=>drop(event,'rolecards')}"/>
							{/each}
						</div>
					{/if}
					{#if !game.center_or_planets}
						<div class="flex zone centerrow">
							{#each player.unsettled_planets as planet (planet.id)}
								<PlanetCard planet={planet} on:click={f=>choosewrapper(planet,'unsettled_planets')}/>
							{/each}
							{#each [...player.settled_planets, ...player.conquered_planets] as planet (planet.id)}
								<PlanetCard planet={planet} selected={game.zone=='settled_&_conquered_planets'} on:click={f=>choosewrapper(planet,'settled_&_conquered_planets')} />
							{/each}
						</div>
					{/if}
					<!-- played cards-->
					<div id="playedcards" class="flex zone playedcards" >
						<div style="margin-right:auto" class="selectable pass" 
							on:click={(game.skip)?f=>choose([{name:'Skip'}]):f=>{}}>
							{(game.skip)?'[Choose None]':'[______]'}
						</div>
						{#each game.players[game.actPlyrIndx].limbo as card (card.id)}
							<Card mini={true} on:click={f=>unchoose(card)} {card}/>
						{/each}
						<div style="margin-left:auto" class="selectable pass" 
							on:click={(game.passp)?f=>pass_priority():(game.passt)?f=>pass_turn():(game.alwMulti && game.choices.length>0)?f=>choose(game[game.choicelabel]):f=>{}}>
							{(game.passp)?'[Pass to <br> Next Player]':(game.passt)?'[End Turn]':(game.alwMulti && game.choices.length>0)?'[Choose Selected]':'[______]'}
						</div>
					</div>
					<div class="msgtoplayer bordered">{game.msgtoplayer[game.msgtoplayer.length-1]}</div>
					<!-- hand -->
					<div class="flex zone ownedcards">
						<div class='bordered deck'>{player.deck.length}</div>
						<div class='hand'>
							{#each player.hand as card (card.id)}
								<Card card={card} mini={true} selectable={game.zone=='hand'} on:touchstart={(event)=>drag(event, card,'hand')} on:touchend={(event)=>drop(event,'hand')} on:touchmove={(event)=>move(event, card.imgurl,'hand')} on:click={f=>{log(card);choosewrapper(card,'hand');}}/>
							{/each}
						</div>
						<div class="bordered discard">{player.discard.length}</div>
					</div>
				{/if}
			{/each}
			<!-- game.options -->
			{#if game.zone=='options'}
				<div class="{( game.options[0] !== undefined && game.options[0].type !== undefined) ? 'talloptions' : 'options'}">
					{#each game.options as option (option.name)}
						{#if option.type !== undefined}
							<PlanetCard planet={option} selectable={game.zone=='options'} on:click={f=>choosewrapper(option,'options')}/>
							<PlanetCard planet={{...option,settled:true}} selectable={game.zone=='options'} on:click={f=>choosewrapper(option,'options')}/>
						{:else}
							<div class="pass {(game.zone=='options') ? ( (option.selected) ? 'selected' : 'selectable' ): 'bordered'}" on:click={f=>choosewrapper(option,'options')}>
								{option.name}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	{/if}
</div>
<script>
	import Card from '../components/Card.svelte';
	let game, lobby, phases, corephases, actioncardphases, mounted = false, ws;
	import { onMount } from 'svelte';
	onMount(()=>{
		////////////////////////////////////////////////////////////////////////////////
		corephases = [
			/*colonize:*/ {
				actn:[
					genActionPhase( "Choose between Settling or Colonizing a Planet", ["colonize"],
						wrappedOffer(["Colonize","Settle Coloniies"]),
					),
					genActionPhase( "Choose an Unsettled Planet to Settle", ["colonize"],
						() => offer(false,false,["unsettled_planets"],"subchoices",finish),
						["Settle Colonies"],
					),
					genActionPhase( "Settling your Planet", ["colonize"],
						() => settle_colonies(getSubChoice(),getActPlyr()),
						["Settle Colonies"]
					),
					genActionPhase( "Choose an Unsettled Planet to Colonize", ["colonize"],
						() => offer(false,false,["unsettled_planets"],"subchoices",finish),
						["Colonize"],
					),
					genActionPhase( "Colonizing your Planet", ["colonize"],
						() => { colonize(getSubChoice(),getActPlyr().limbo,getActPlyr().limbo.filter(el => el.type == "colonize")[0]); finish(true);},
						["Colonize"],
					),
				],
				lead:[
					genLeadPhase( "Choose between Settling or Colonizing a Planet", ["colonize"],
						wrappedOffer(["Colonize","Settle Colonies"]),
						),
					genLeadPhase( "Choose an Unsettled Planet to Settle", ["colonize"],
						() => offerUnsettled(),
						["Settle Colonies"],
						),
					genLeadPhase( "Settling your Planet", ["colonize"],
						() => {settle_colonies(getSubChoice(), getActPlyr() ); finish(); },
						["Settle Colonies"],
						),
					genLeadPhase( "Choose an Unsettled Planet to Colonize", ["colonize"],
						() => offerUnsettled(),
						["Colonize"],
						),
					genLeadPhase( "Colonizing your Planet", ["colonize"],
						() => {
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
						() => {
							if (0 == getActPlyr().permanents.filter(e => "bureaucracy" == e.type).length) {
								game.choices = [{name: "Colonize"}];
								finish(!0);
							} else simpleOffer(["Colonize","Settle Colonies"])
						},
					),
					genFollowPhase( "Choose an Unsettled Planet to Settle", ["colonize"],
						() => offerUnsettled(),
						["Settle Colonies"],
					),
					genFollowPhase( "Settling your Planet", ["colonize"],
						() => { settle_colonies(getSubChoice(), getActPlyr()); finish(!0);},
						["Settle Colonies"],
					), 
					genFollowPhase( "Choose an Unsettled Planet to Colonize", ["colonize"], 
						() => offerUnsettled(),
						["Colonize"],
					),
					genFollowPhase( "Colonizing your Planet", ["colonize"],
						() => {
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
						() => offer( false, false , ["settled_&_conquered_planets"], "subchoices", finish ),
						["produce"],
					),
					genActionPhase( "Producing a Resource", ["producetrade"],
						() => { produce(getSubChoices()); finish(true);},
						["produce"],
					),
					genActionPhase( "Choose a Planet to Trade Resources from", ["producetrade"],
						() => offer( false, false, ["settled_&_conquered_planets"], "subchoices", finish),
						["trade"],
					),
					genActionPhase( "Trading a Resource", ["producetrade"],
						() => {trade(getSubChoices(),getActPlyr()); finish();},
						["trade"],
					)
				],
				lead:[
					genLeadPhase( "Choose between Producing or Trading Resources", ["producetrade"],
						() => offer( false , false , ["options",[{ name: "produce" }, { name: "trade" }]], "choices", finish ),
					),
					genLeadPhase( "Choose a Planet to Produce Resources on", ["producetrade"],
						() => offer( true , true , [ "settled_&_conquered_planets" ], "subchoices", finish ),
						["produce"],
					),
					genLeadPhase( "Producing a Resource", ["producetrade"],
						() => {
							getActPlyr().activerole = "produce";
							let prd = produce( getSubChoices(), getActPlyr().bstIcons.produce );
							if ( getActvActn() == "genetic_engineering" ) prd.forEach((plyr)=>plyr = [...plyr,{influence:[...plyr.influence,game.influence.pop()]}]);
							finish(true);
						},
						["produce"],
					),
					genLeadPhase( "Choose a Planet to Trade Resources from", ["producetrade"],
						() => offer( true , true , [ "settled_&_conquered_planets" ],"subchoices", finish ),
						["trade"],
					),
					genLeadPhase( "Trading a Resource", ["producetrade"],
						() => {
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
						() => offer(!0, !0, ["settled_&_conquered_planets"], "subchoices", finish),
					),
					genFollowPhase( "Producing a Resource", ["produce"],
						() => {
							let e = game;
							getActPlyr().activerole = "produce";
							produce(e.subchoices, e.players[game.acting_player_index].bstIcons.produce); finish(!0)
						},
					),
					genFollowPhase( "Choose a Planet to Trade Resources from", ["trade"],
						() => offer(!0, !0, ["settled_&_conquered_planets"], "subchoices", finish),
					),
					genFollowPhase( "Trading a Resource", ["trade"],
						() => {
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
						() => offer(false, false, ["rolecards"], "choices", finish ),
					),
					genActionPhase(
						"Swapping the Role Card for your Politics Card",
						["politics"],
						() => {politics(getActPlyr().limbo.filter(el => el.type == "politics")[0], getChoices()[0], getActPlyr() ); finish(true);},
					),
				],
				lead:[],
				fllw:[],
				clnp:[],
			},
			/*/research:/*/ {
				actn:[
					genActionPhase( "Choose up to 2 Cards from your Hand to Remove from the Game", ["research"],
						() => offer( false, true,["hand"], "choices", finish),
					),
					genActionPhase( "Removing your Cards from the Game", ["research"],
						() => {research(getChoices(),getActPlyr()); finish(true);},
					),
				],
				lead:[
					genLeadPhase( "Choose a Technology to Research", ["research"],
						() => offer( true , false , ["research" ], "choices", finish   ),
					), 
					genLeadPhase( "Researching your Technology", ["research"],
						() => {
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
						() => offer(!0, !1, ["research"], "choices", finish),
					),
					genFollowPhase( "Researching your Technology", ["survey"],
						() => {
							let e = game;
							if ("Skip" != e.choices[0].name) {
								let a = { advanced: 0, metallic: 0, fertile: 0 };
								[...e.players[game.acting_player_index].settled_planets, ...e.players[game.acting_player_index].conquered_planets].map(e => {
									a[e.type]++
								});
								let p = !0;
								for (let i in e.choices[0].planet_requirements) e.choices[0].planet_requirements[i] > a[i] && (p = !1);
								p && e.players[game.acting_player_index].bstIcons.research >= e.choices[0].research_cost && play(e.research_deck, e.players[game.acting_player_index].limbo, "discard", e.choices[0].id)
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
						() => {survey(getActPlyr()); finish(true);},
					),
				],
				lead:[
					genLeadPhase(
						"Choose a Planet from your Galaxy to Explore",
						["survey"],
						() => {
							for ( let i = 0; i < getActPlyr().bstIcons.survey; i++ ) {
								explore_planet( getActPlyr() );
							}
							offer( true , false , [ "options", game.options ], "choices",finish   );
						}
					),
					genLeadPhase(
						"Surveying your Empire",
						["survey"],
						() => {
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
						() => {
							let e = game;
							for (let a = 0; a < e.players[game.acting_player_index].bstIcons.survey - 1; a++) explore_planet(e.players[game.acting_player_index]);
							offer(!0, !1, ["options"], "choices", finish)
						},
					),
					genFollowPhase(
						"Surveying your Empire",
						["survey"], 
						() => { if (getChoice() == "Skip") finish(); catalog_planet(game.players[game.acting_player_index]); finish(!0)},
					),
				],
				clnp:[
					{"":
					()=>{}},
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
						() => {warfare(getActPlyr()); finish(true);},
						["Collect a Starfighter"],
					),
					genActionPhase(
						"Choose a Planet to Conquer",
						["warfare"],
						() => offer(false, false, ["unsettled_planets"], "subchoices", finish),
						["Conquer a Planet"],
					),
					genActionPhase(
						"Conquering your planet",
						["warfare"],
						() => {conquer(getSubChoice(),getActPlyr()); finish(true);},
						["Conquer a Planet"],
					),
				],
				lead:[
					genLeadPhase( "Choose between Collecting Starfighters or Conquering a Planet", ["warfare"],
						wrappedOffer(["Conquer a Planet", "Collect Starfighters"]),
					),
					genLeadPhase( "Adding Starfighters to your Fleet", ["warfare"],
						() => {
							range(1,getActPlyr().bstIcons.warfare).forEach( ()=>warfare( getActPlyr() ) );
							finish(true);
						},
						["Collect Starfighters"],
					),
					genLeadPhase( "Choose a Planet to Conquer", ["warfare"],
						() => offerUnsettled(),
						["Conquer a Planet"],
					),
					genLeadPhase( "Conquering your planet", ["warfare"],
						() => {
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
						() => {
							if (0 == game.players[game.acting_player_index].permanents.filter(e => "bureaucracy" == e.type).length) {
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
						() => {
							for (let e = 0; e < game.players[game.acting_player_index].bstIcons.warfare; e++) warfare(game.players[game.acting_player_index]);
							finish(!0)
						},
						["Collect Starfighters"],
					),
					genFollowPhase(
						"Choose a Planet to Conquer",
						["warfare"], 
						() => offer(!1, !1, ["unsettled_planets"], "subchoices", finish),
						["Conquer a Planet"],
					),
					genFollowPhase(
						"Conquering your planet",
						["warfare"], 
						() => {conquer(game.subchoices[0], game.players[game.acting_player_index]); finish(!0);},
						["Conquer a Planet"],
					),
				],
				clnp:[
					{"":
					()=>{}},
				],
			},
		];
		actioncardphases = [
			// #######################################################################################################################################################################################
			// improved_colonize 
			genActionPhase(
				"Choose wether or not to Settle a Planet",
				["improved_colonize"],
				() => offer( true, false, [ "options", [{ name: "settle" }, { name: "Skip" }]], "choices", finish)
			),
			genActionPhase(
				"Choose a Planet to Settle",
				["improved_colonize"],
				() => offerUnsettled(),
				["settle"],
				),
			genActionPhase(
				"Settling your Planet",
				["improved_colonize"],
				() => { settle_colonies(getSubChoice(),getActvPlyr()); finish(true);},
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
				() => offerUnsettled(),
				["Settle Colonies"],
				),
			genActionPhase(
				"Settling your Planet",
				["improved_colonize"],
				() => { settle_colonies( getSubChoice(), getActPlyr()); finish(true);},
				["Settle Colonies"],
				),
			genActionPhase(
				"Choose an Unsettled Planet to Colonize",
				["improved_colonize"],
				() => offerUnsettled(),
				["Colonize"],
				),
			genActionPhase(
				"Colonizing your Planet",
				["improved_colonize"],
				() => { colonize( getSubChoice(), getActPlyr().limbo, getActPlyr().limbo.filter(el => el.type == "improved_colonize")[0]); finish(true);},
				["Colonize"],
				),
			// #######################################################################################################################################################################################
			// improved_produce : 4
			genActionPhase(
				"Choose an empty Production Zone to Produce in",
				["improved_production"],
				() => offer( true, false, ["settled_&_conquered_planets"], "choices" , finish),
				),
			genActionPhase(
				"Producing your Resource",
				["improved_production"],
				() => { 
					if (getChoice() == "Skip") finish(); produce(game.choices); finish(true);},
				),
			genActionPhase(
				"Choose an empty Production Zone to Produce in",
				["improved_production"],
				() => offer(true, false, ["settled_&_conquered_planets"], "choices", finish),
				),
			genActionPhase(
				"Producing your Resource",
				["improved_production"],
				() => { if (getChoice() == "Skip") finish();produce(game.choices); finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_trade : 1
			genActionPhase(
				"Trading your Stocks and Bonds",
				["improved_trade"],
				() => {
					game.players[game.acting_player_index].influence.push( game.influence.pop() );
					finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_research : 2
			genActionPhase(
				"Choose up to 3 Cards from your Hand to Remove from the Game",
				["improved_research"],
				() => {
					draw(getActPlyr());
					offer(false, true, ["hand"], "choices", finish);}
				),
			genActionPhase(
				"Removing your Cards from the Game",
				["improved_research"],
				() => {research(getChoices(), getActPlyr(), 3); finish(true);},
				),
			// #######################################################################################################################################################################################
			// improved_survey : 1
			genActionPhase(
				"Drawing your Cards",
				["improved_survey"],
				() => {
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
				() => {warfare(getActPlyr()); warfare(getActPlyr()); finish(true);},
				["Collect a Starfighter"]
				),
			genActionPhase(
				"Choose a Planet to Conquer",
				["improved_warfare"],
				() => offerUnsettled(),
				["Conquer a Planet"]
				),
			genActionPhase(
				"Conquering your planet",
				["improved_warfare"],
				() => { conquer(getSubChoice(),getActPlyr()); finish(true);},
				["Conquer a Planet"]
				),
			// #######################################################################################################################################################################################
			// mobilization : 4
			genActionPhase(
				"Collecting your Star Fighters",
				["mobilization"],
				() => { warfare(getActPlyr()); warfare(getActPlyr()); finish(true);},
				),

			// #######################################################################################################################################################################################
			// survey_team : 1
			genActionPhase(
				"Adding Top Card of the Planet deck to your Empire",
				["survey_team"],
				() => {
					let { game: game, game: { acting_player: player, planet_deck: planet_deck } } = get();
					player = game.players[game.acting_player_index];
					let planet = planet_deck.pop();
					player.unsettled_planets.push(planet);
					finish(true);},
				),
			// #######################################################################################################################################################################################
			// war_path : 4
			genActionPhase(
				"Choose a Planet to Conquer",
				["war_path"],
				() => offerUnsettled(),
				),
			genActionPhase(
				"Conquering your planet",
				["war_path"],
				() => { if (getChoice() == "Skip") finish(); conquer(getChoice(),getActPlyr()); finish(true);},
				),
			genActionPhase(
				"Choose a Planet to Conquer",
				["war_path"],
				() => offerUnsettled(),
				),
			genActionPhase(
				"Conquering your planet",
				["war_path"],
				() => { if (getChoice() == "Skip") finish(); conquer(getChoice(),getActPlyr()); finish(true);},
				),
			// #######################################################################################################################################################################################
			// terraforming : 2
			genActionPhase(
				"Choose an Unsettled Planet to Terraform",
				["terraforming"],
				() => offerUnsettled()
				),
			genActionPhase(
				"Terraforming your Planet",
				["terraforming"],
				() => {
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
				() => offer( false,  false, ["rolecards"], "choices", finish)
				),
			genActionPhase(
				"Adding Role Card to your Machine Learning Model",
				["artificial_intelligence"],
				() => {
					let { game: game, game: { acting_player: player } } = get();
					player = game.players[game.acting_player_index];
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
				() => offer( false,  false, [ "rolecards" ], "choices", finish)
				),
			genActionPhase(
				"Adding Role Card to your Machine Learning Model",
				["artificial_intelligence"],
				() => {
					let { game: game, game: { acting_player: player } } = get();
					player = game.players[game.acting_player_index];
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
				() => { getActPlyr().specialization = getChoice(); finish(true);},
				),
			// #######################################################################################################################################################################################
			// data_network : 3
			genActionPhase(
				"Drawing Your Cards",
				["data_network"],
				() => { draw(getActPlyr()); draw(getActPlyr()); finish(true);},
				),
			genActionPhase(
				"Choose any number of Cards from your Hand to Remove from the Game",
				["data_network"],
				() => offer( true, true, [ "hand" ], "choices", finish),
				),
			genActionPhase(
				"Removing the Selected Cards from the Game",
				["data_network"],
				() => {
					if (getChoice() == "Skip") finish();
					let { game: game, game: { choices: choices, acting_player: player } } = get();
					player = game.players[game.acting_player_index];
					research(choices, player, choices.length); finish(true);},
			)
		];
		let nonce = 0;
		game = {
			minPlyrs: 2,
			maaxPlyrs: 4,
			passtoplayer: false,
			nonce: 0,
			displayinfo: {
				selectionzone: "",
				dragged: null,
				showoptiontoskip: false,
				allowformultipleselections: false,
				center_or_planets: true, //true = center, false = planets
				choicelabel: "choices"
			},
			subchoices: [],
			influence: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			messagetoplayer: ['Waiting for other players to join'],
			options: [],
			planet_deck: [],
			currentphase: -4,
			leading_player_index: 0,
			acting_player_index: 0,
			number_of_players: 2,
			started: false,
			gamephases: [
				{
				start: [
					{
					"set active player": () => {
						if (game.started) {
						game.started = true;
						game.passt = false;
						game.leading_player_index =
							(game.leading_player_index + 1) % game.number_of_players;
						game.acting_player_index = game.leading_player_index;
						game.leadingplayer = game.players[game.leading_player_index];
						game.acting_player = game.players[game.leading_player_index];
						openFullscreen();
						}
						if (game.leadingplayer !== undefined) {
						game.players[game.leading_player_index].rounds++;
						}
						let planets = [
						...game.players[game.leading_player_index].settled_planets,
						...game.players[game.leading_player_index].conquered_planets
						];
						for (let p in planets) {
						tallyIcons(game.players[game.leading_player_index],planets[p]);
						}
						for (let p in game.players[game.leading_player_index].permanents) {
						tallyIcons(game.players[game.leading_player_index],permanents[p]);
						}
						finish(true);
					}
					},
					{
					Productivity: () => {
						if ( getActPlyr().permanents.filter(el => el.type == "productivity").length != 0 ) {
						getActPlyr().actionrolesequence = "aar";
						}
						finish();
					}
					},
					{
					"Choose an Order to Perform Your Action and Role Phases": () => {
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
					Logistics: () => {
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
						"Choose an Action to Play": () => {
						offer( true, false, [ "hand" ], "choices", finish );
						}
					},
					{
						"Playing your Action": () => {
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
					"Choose a Role Card to Lead with": () => {
						offer( false , false, [ "rolecards" ], "choices", finish );
					}
					},
					{
					"Performing your Role": () => {
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
						"Choose cards from your hand to Boost the effectiveness of your Role": () => {
							offer( true , true, [ "hand" ], "choices", finish );
						}
					},
					{
						"Boosting your Role": () => {
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
					"Pass the device to the Next Player": () => {
						game.displayinfo.selectionzone = "";
						game.passp = true;
					}
					},
					{
					"You passed Priority": () => {
						game.passp = false;
						finish(true);
					}
					}
				]
				},
				{
				follow: [
					{
					"Choose between Following or Dissent the Leading Role": () => {
						simpleOffer(["dissent",getLeadPlyr().activerole]);
					}
					},
					{
					Dissenting: () => {
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
					"Choose cards from your hand to Boost the effectiveness of your Role": () => {
						if ( getActPlyr() .activerole == "dissent" ) {
							finish();
						} else {
							offer( true , true , [ "hand" ], "choices",finish   );
						}
					}
					},
					{
					"Boosting your Role": () => {
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
					"Pass the device to the Next Player": () => {
						game.displayinfo.selectionzone = "";
						game.passp = true;
					}
					},
					{
					"You passed Priority": () => {
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
					"Would you like to Mobilize against a Planet": () => {
						if ( getActPlyr() .activeaction != "mobilization" ) {
						finish();
						} else {
						offer( true , false , [ "options", [{ name: "mobilize" }, { name: "skip" }] ], "choices",finish   );
						}
					}
					},
					{
					"Choose a Planet to Mobilize Against": () => {
						if ( getActPlyr() .activeaction != "mobilization" ||  getChoice() != "mobilize" ) {
						finish();
						} else {
						offerUnsettled();
						}
					}
					},
					{
					"Mobalizing against your Planet": () => {
						if ( getActPlyr().activeaction != "mobilization" ) {
						finish();
						} else {
						conquer(getSubChoice(), getActPlyr() );
						finish(true);
						}
					}
					},
					{
					"Would you like to Streamline Your Empire": () => {
						if (getActPlyr().permanents.filter(el => el.type == "streamlining" ).length == 0
						) {
						finish();
						} else {
						offer( false , false , [ "options", [{ name: "Decline" }, { name: "Streamline Empire" }]  ], "choices",finish   );
						}
					}
					},
					{
					"Choose a Card from Your Hand to Remove from the Game": () => {
						if ( getActPlyr().permanents.filter(el => el.type == "streamlining").length == 0 || getChoice() != "Streamline Empire"
						) {
						finish();
						} else {
						offer( true , false , [ "hand" ], "subchoices", finish );
						}
					}
					},
					{
					"Streamlining Your Empire": () => {
						if ( getActPlyr().permanents.filter(el => el.type == "streamlining" ).length == 0 || getChoice() != "Streamline Empire" || getChoice() == "Skip" ) {
						finish();
						} else {
						research( getChoices(), getActPlyr(), 1 );
						}
					}
					},
					{
					"Would you like to Utilize Your Empire's Hyperefficiency": () => {
						if ( getActPlyr().permanents.filter(el => el.type == "hyperefficiency" ).length == 0 ) {
						finish();
						} else {
						simpleOffer(["Decline", "Utilize Hyperefficiency" ]);
						}
					}
					},
					{
					"Choose a Card from Your Hand to Remove from the Game": () => {
						if ( getActPlyr().permanents.filter(el => el.type == "hyperefficiency").length == 0 || getChoice() != "Utilize Hyperefficiency" ) {
						finish();
						} else {
						offer( true , true , [ "hand" ], "subchoices",finish );
						}
					}
					},
					{
					"Your Empire is Hyperefficient": () => {
						if ( getActPlyr().permanents.filter(el => el.type == "hyperefficiency").length == 0 || getChoice() != "Utilize Hyperefficiency" || getChoice() == "Skip" ) {
						finish();
						} else {
						research( getChoices(), getActPlyr(), getChoices().length );
						}
					}
					},
					{
					"Choose any Cards you would like to Discard": () => {
						offer( true , true, [ "hand" ], "choices", finish );
					}
					},
					{
					"Discarding your Selected Cards": () => {
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
					"Drawing up to your Hand Size": () => {
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
					"Pass the device to the Next Player": () => {
						game.displayinfo.selectionzone = "";
						game.displayinfo.showoptiontoskip = false;
						game.displayinfo.allowformultipleselections = false;
						game.passp = false;
						game.passt = true;
					}
					},
					{
					"You passed the Turn": () => {
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
				screenname: "",
				url: url,
				sets: ["Base Game"],
				number_of_players: [2, 3, 4],
				existinggames: []
			};
			game.nonce = nonce;
			mounted = true;
	
	
	
	})
	///////////////////////////////////////////////////////////////////////////////
	let  	clearOptions = () => game.options = [],
			offerUnsettled = () => offer( false,  false, ["unsettled_planets"], "subchoices", finish),
            getActionCardPhases = () => actioncardphases,
            getActvActn = () => getActPlyr().activeaction,
            getActvRole = () => getActPlyr().activerole,
            getChoice = () => game.choices[0].name,
            getChoices = () => game.choices,
            getSubChoice = () => getSubChoices()[0],
            getSubChoices = () => game.subchoices,
            finish = (cond=false) => phasefinishfunction(cond),
            getActPlyr = () => game.players[game.acting_player_index],
            getLeadPlyr = () => game.players[game.leading_player_index],
            simpleOffer = (choices) => offer( false, false, ["options", choices.reduce((acc,cur)=>[...acc,{name:cur}],[])], "choices", finish),
            wrappedOffer = (choices) => () => simpleOffer(choices),
            getActionCorePhases = () => corephases.reduce((acc,cur)=>[...acc,cur.actn],[]).reduce((acc,cur)=>[...acc,...cur],[]),
            getLeadCorePhases =   () => corephases.reduce((acc,cur)=>[...acc,cur.lead],[]).reduce((acc,cur)=>[...acc,...cur],[]),
            getFollowCorePhases = () => corephases.reduce((acc,cur)=>[...acc,cur.fllw],[]).reduce((acc,cur)=>[...acc,...cur],[]),
            genActionPhase = (name,actions,phase,choices=[],cond=false) => ({ [name] : ()=>{ if ( actions.includes(getActvActn()) && (choices.length==0 || choices.includes(getChoice()))) { phase() } else { finish(cond) } }}),
            genLeadPhase   = (name,actions,phase,choices=[],cond=false) => ({ [name] : ()=>{ if ( actions.includes(getActvRole()) && (choices.length==0 || choices.includes(getChoice()))) { phase() } else { finish(cond) } }}),
            genFollowPhase = (name,actions,phase,choices=[],cond=false) => ({ [name] : ()=>{ if ( actions.includes(getActvRole()) && (choices.length==0 || choices.includes(getChoice()))) { phase() } else { finish(cond) } }}),
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
            offlineOrIsClientTurn = () => (lobby.screenname == getActPlyr().name || !lobby.online),
            setChoice = (chc) => game[game.displayinfo.choicelabel] = chc,
            cleanOptions = () => game.options=[],
            displayPlanets = () => game.displayinfo.center_or_planets = false,
            displayCenter = () => game.displayinfo.center_or_planets = true,
            clearChoices = () => game[game.displayinfo.choicelabel] = [],
            setDisplayInfo = (zone,multiple,skippable,label) => game.displayinfo = {...game.displayinfo,...{selectionzone:zone,allowformultipleselections:multiple,showoptiontoskip:skippable,choicelabel:label}},
            getAllCards = (plyr) => [...plyr.deck,...plyr.discard, ...plyr.limbo, ...plyr.hand],
            isPlanet = (p) => p.type=='planet' || p.type=='fertile' || p.type=='metallic' || p.type=='advanced',
            chkForPerm = (perm) => getActPlyr().permanents.filter( (el)=>el.type==perm ).length != 0,
            range = (min,max) => (min <= max) ? [...range(min, max-1),max] : [],
            singleCllBck = (cllBck,e,func) => () => {func(); document.removeEventListener(e,this); cllBck();},
            produceTradeHelper = (filled,planets,resources,func=()=>{}) => { let prd = {blue:0,green:0,purple:0,red:0}; planets.forEach((planet) =>  planet.production_zones.forEach((zone)=>{     if (!zone.filled && resources > 0) {         zone.filled = filled;         prd[zone.type]++;         resources--;         func()     }  }) );return prd;};
	
	let choosewrapper = (c,zone) => {
		if ((game.displayinfo.selectionzone == zone) && offlineOrIsClientTurn()){
			(game.displayinfo.allowformultipleselections) ? multiplechoose(c) : choose([c]);
		}
	};
	let multiplechoose = (choice) => {
		if (offlineOrIsClientTurn()){		
			if ( !game[game.displayinfo.choicelabel].includes(choice) ) {
				setChoice([...game[game.displayinfo.choicelabel],choice]);
				choice.selected=true;
				if (!isPlanet(choice) && choice.name != 'Skip') handToLimbo(getActPlyr(),choice);
			}
			else {
				choice.selected=false;
				if (!isPlanet(choice) && choice.name != 'Skip'){
					setChoice(game[game.displayinfo.choicelabel].filter( (el)=> el.id != choice.id ));
					limboToHand(getActPlyr(),choice);
				}
			}
		}
	};
	let choose = (choices) => {
		if (offlineOrIsClientTurn()){
			clearOptions();
			resetSelection(choices);
			setChoice(choices);
			finish();
		}
	};
	let unchoose = (choice) => {
		if (offlineOrIsClientTurn()){
			if ( game[game.displayinfo.choicelabel].includes(choice) ) {
				choice.selected=false;
				setChoice( game[game.displayinfo.choicelabel].filter( (el) => el.id != choice.id ));
				limboToHand(getActPlyr(),choice);
			}
		}
	};
	let offer = (
		skippable /*option to skip | sets game.displayinfo.showoptiontoskip=boolean */,
		multiple /*allows multiple choices | sets game.displayinfo.allowformultipleselections=boolean */, 
		[field_label, choices] /* available cards to choose from | game.displayinfo.selectionzone={'hand|discard|options|planets|research|rolecards'}, sets choices=array if specified*/, 
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
		let toRemove = source_array.find((e) => id == e.id);
		destination_array = [...destination_array,toRemove];
		source_array = source_array.filter((e) => e.id != toRemove.id);
	};
	//draw deck->hand
	let totalinfluence = () => {
		game.players.forEach((plyr) => {
			plyr.influence = plyr.influence.reduce((acc,cur) => acc + cur,0) + getAllCards(plyr).reduce((acc,cur) => acc + cur.influence);
		}) ;
	};
	let endgame = () => {
		//display victor
		let scores = game.players.map(e => e.influence);
		let winner = '';
		let highest = scores[0];
		game.players.map((e) => { if ( highest < e.influence ) { winner = e.name; highest = e.influence; } } );
	};
	let checkforendgame = () => {
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
		let toRemove = source_array.find((e) => id == e.id);
		destination_array = [...destination_array,{...toRemove,finDest:finDest}];
		source_array = source_array.filter((e) => e.id != toRemove.id);
	};
	let gen_research_card = (name) => {
		return {
			name:name,
			type:name,
			id:gen_unique_id(),
			icons:{'survey':0,'warfare':0,'colonize':0,'produce':0,'trade':0,'research':0},
			planet_requirements:{'advanced':0, 'metallic':0, 'fertile':0},
			research_cost:0,
			action:()=>{},
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
	let gen_research_deck = () => {
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
	let genplanetdeck = () => { 
		game.planet_deck = knuthshuffle([
			//fertile planets
			genplanet('MISHBURR ITO-A').fertile().settle(5).conquer(4).zone('green')              .influence(3).icon('produce')   ,
			genplanet('STYKU').fertile().settle(4).conquer(5).zone('blue')               .influence(3).icon('colonize')  ,
			genplanet('ANGUS DUFFY').fertile().settle(3).conquer(6).zone('green').zone('blue') .influence(3)                   ,
			genplanet('GERDLAND').fertile().settle(4).conquer(5).zone('blue')               .influence(3).icon('produce')   ,
			genplanet('MIK-MIK').fertile().settle(5).conquer(4).zone('green')              .influence(3).icon('colonize')  ,
			genplanet('NELOS IV').fertile().settle(5).conquer(4).zone('green')              .influence(2)      .handsize(1) ,
			genplanet('SPIELBANY VI').fertile().settle(4).conquer(5).zone('blue')               .influence(2)      .handsize(1) ,
			genplanet('NEW TEXAS').fertile().settle(3).conquer(6).zone('green').zone('blue') .influence(2).icon('colonize')  ,
			genplanet('ARTIGAS GNS-111').fertile().settle(3).conquer(6).zone('green').zone('blue') .influence(2).icon('produce')   ,
			//advanced planets
			genplanet('HANOJ - T').advanced().settle(5).conquer(4).influence(3).zone('purple').icon('trade'),
			genplanet('OKNOW').advanced().settle(4).conquer(5).influence(2).zone('purple')                              .handsize(1),
			genplanet('SROD AVEIN N2').advanced().settle(3).conquer(6).influence(4)                             .icon('research'),
			genplanet("RAL GAI'GAW").advanced().settle(4).conquer(5).influence(3).zone('purple').icon('trade'),
			genplanet('ECHO ROSE').advanced().settle(5).conquer(4).influence(3).zone('purple')              .icon('research'),
			genplanet('SHOLMICAN').advanced().settle(3).conquer(6).influence(4).zone('purple'),
			genplanet('ZEPHAN').advanced().settle(3).conquer(6).influence(4)               .icon('trade'),
			genplanet('SIMA-07C').advanced().settle(5).conquer(4).influence(2).zone('purple')                              .handsize(1),
			genplanet('LYTTLE').advanced().settle(4).conquer(5).influence(3).zone('purple')              .icon('research'),
			//mettalic planets
			genplanet('KYRIE & JUNO').metallic().settle(3).conquer(6).influence(4)            .icon('survey'),
			genplanet('MARGHANNAH PRIME').metallic().settle(4).conquer(5).influence(3)                           .handsize(1),
			genplanet('TANKAHSHIN').metallic().settle(4).conquer(5).influence(3).zone('red').icon('warfare'),
			genplanet('VOSON').metallic().settle(4).conquer(5).influence(3).zone('red').icon('survey'),
			genplanet('PINK SONAR').metallic().settle(5).conquer(4).influence(3).zone('red').icon('survey'),
			genplanet("OVERLORD BETZEL'S DOMAIN").metallic().settle(3).conquer(6).influence(4)            .icon('warfare'),
			genplanet('8910 SPIELEN').metallic().settle(4).conquer(5).influence(2).zone('red')               .handsize(1),
			genplanet('IDROYOS').metallic().settle(3).conquer(6).influence(5),
			genplanet('ERKAM-W').metallic().settle(5).conquer(4).influence(3).zone('red').icon('warfare')
		]);
		game.stacks.startingplanets = knuthshuffle([
			genplanet('MESIA SEDNIM').fertile().settle(2).conquer(2).influence(2).zone('blue'),
			genplanet('DRAWDE').fertile().settle(2).conquer(2).influence(2).zone('green'),
			genplanet('LIAGIBA').advanced().settle(2).conquer(2).influence(2).zone('purple'),
			genplanet('POMERENE').advanced().settle(2).conquer(2).influence(2).zone('purple'),
			genplanet('CHRISPEN').metallic().settle(2).conquer(2).influence(2).zone('red'),
			genplanet('PIEDRA SECA').metallic().settle(2).conquer(2).influence(2).zone('red'),
		])   
	};
	let cleanup = () => {
		getActPlyr().limbo.forEach(card => {
			getActPlyr()[card.finDest] = [ ...getActPlyr()[card.finDest], card ];
		});
	};
	let purchase = (src, dest, finDest, id) => { // duplicate of discard & duplicate of play
		let toRemove = src.find((e) => id == e.id);
		dest = [...dest,{...toRemove,finDest:finDest}];
		src = src.filter((e) => e.id != toRemove.id);
	};
	let remove_from_game = (source_array, toRemove) => { //remove_from_game hand->exile\
		toRemove.finDest="exile";
		return source_array.filter((e) => e.id != toRemove.id);
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
	let pass_turn = () => {
		if (!lobby.online || lobby.screenname == getActPlyr().name ){
			game.passt=false;
			game.acting_player_index = game.leading_player_index = (game.leading_player_index+1)%game.number_of_players;
			game.leadingplayer = game.players[game.leading_player_index];
			game.acting_player = game.players[game.leading_player_index];
			finish();
		}
	};
	//pass_priority actingplayer->nextplayer
	let pass_priority = () => {
		if (offlineOrIsClientTurn()){
			game.passp=false;
			game.acting_player_index = (game.acting_player_index+1)%game.number_of_players;
			game.acting_player = getActPlyr();
			finish();
		}
	};
	//determine_number_of_players logic->options->choice->number_of_players
	let determine_number_of_players = (callback) => {
		document.addEventListener('choicemade',singleCllBck( callback, 'choicemade', () => game.number_of_players = game.choices));
		present_as_choice(range( game.minPlyrs, game.maxPlyrs));
	};
	//produce poduction_pile->host
	let produce = (planets, resources=1) => produceTradeHelper(true,planets,resources);
	//trade host->production_pile, influence_pile->player_influence
	//let trade = (planets, player, resources=1) => produceTradeHelper(false,planets,resources,()=>player.influence.push(game.influence.pop()));
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
			let toRemove = source_array.find((e) => card.type == e.type && e.finDest!='exile');
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
		game.displayinfo.selectionzone = 'hand';
		game.displayinfo.allowformultipleselections = true;
		game.displayinfo.showoptiontoskip = true;
		present_as_choice(player.hand);
		document.addEventListener('choicemade',singleCllBck(()=>{},'choicemade',()=>boost(game.choices, player)));
	};
	let select_via_id = (source, id) => {
		let temp = source.find(p=>p.id==id);
		source = source.filter(p=>p.id!=id);
		return temp
	};
	let boostrolewithcards = (choices, callback=()=>{}) => {
		if (choices[0].name == 'Skip') return;
		choices.forEach((card)=>{
			boostWithIcons(getActPlyr(),card);
			play(getActPlyr().hand,getActPlyr().limbo,'discard',cards[i].id);
		});
		callback();
	};
	let gen_unique_id = () => {
		game.nonce++;	
		return game.nonce;
	};
	let performleaderrole = (callback=()=>{}) => getActPlyr().activerole.role.role.leader(callback);
	let performfollowerrole = (callback=null) => {
		getActPlyr().activerole.set(game.players[game.leading_player_index].activerole.role);
		getActPlyr().activerole.role.role.follower(callback);
	};
	let explore_planet = (player)=>{
		let planet = game.planet_deck.pop();
		player.limbo = [...player.limbo,{'finDest':'planetdeck',...planet}];
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
		game.currentphase = (game.currentphase + 1) % game.gamesequence.length; 
		let jsobj = game.gamesequence[game.currentphase];
		let nextphase,msg;
		for (let key in jsobj){
			msg = key
			nextphase=jsobj[key];
		}
		if (game.nextphase !== endgame){
			game.nextphase = nextphase;
			game.messagetoplayer.push(msg);
		}
		if (send) sendstate();
		game.nextphase();
	};
	let gengamesequence = () => {
		let _gamesequence=[];
		_gamesequence = gshelper([...game.gamephases[0].start],_gamesequence);
		//ar. ra, aar, ara, raa
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, ()=>{return getActPlyr().actionrolesequence=='aar'});
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, ()=>{return getActPlyr().actionrolesequence=='aar' || getActPlyr().actionrolesequence=='ar'  });
		
		_gamesequence = gshelper([...game.gamephases[2].role],_gamesequence);
		_gamesequence = gshelper([...game.gamephases[3].lead],_gamesequence);
		for (let i = 1; i<game.number_of_players; i++){
			_gamesequence = gshelper([...game.gamephases[4].follow],_gamesequence);
		}
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, ()=>{return getActPlyr().actionrolesequence=='raa' || getActPlyr().actionrolesequence=='ara'  });
		_gamesequence = gshelper([...game.gamephases[1].action],_gamesequence, ()=>{return getActPlyr().actionrolesequence=='raa'});

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
				item[key] = ()=>{
					if (wrapperfunction()){
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
	let gennewdeck = () => {
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
					let callbackwrapper = ()=>{ 	
						document.removeEventListener('choicemade',callbackwrapper);
						politics(getActPlyr().activeaction, game.choices[0], getActPlyr());
						callback();
					};	
					game.displayinfo.center_or_planets=true;
					game.displayinfo.selectionzone='rolecards';
					game.displayinfo.allowformultipleselections=false;
					game.displayinfo.showoptiontoskip=false;
					game.messagetoplayer.push('choose a card from the center row to add to your hand');
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
	let phaseincrement = () => game.currentphase++;
	let newgame = (number_of_players) => {
		lobby.online=true;
		initgame(number_of_players);
		initSocket(()=>ws.emit('message',JSON.stringify({'header':'newgame',game:game,sets:lobby.sets,number_of_players:game.players.length})));
		
	};
	let initSocket = (func) => {
		let ping = () => { setTimeout( () => { ws.emit('message',JSON.stringify({header:'ping'})); ping(); },2000); };
		ws = io();
		ws.on('connect',()=>{ console.log('connected');
			ws.on('id',(msg)=>{ console.log('id');
				console.log(JSON.parse(msg));
				game = {...game,
					game_id:JSON.parse(msg),
					hader:'',
					currentphase:game.currentphase+1};
				lobby = {...lobby,
					existinggames:[...lobby.existinggames, game],
					online:true};
				registerws();
			});
			ws.on('fetch',(msg)=>{ console.log('fetch');
				console.log(JSON.parse(msg));
				game.currentphase = -1;
				lobby = {...lobby,
					existinggames: JSON.parse(msg).map(el=>el.game).filter(g=>g.players.filter(ll=>ll.available).length > 0),
					online:true}
			});
			ws.on('enter',(msg)=>{ console.log('enter');
				console.log(JSON.parse(msg));
				game = {...JSON.parse(msg),phasse:game.phases,gamesequence:game.gamesequence,currentphase:game.currentphase};
				lobby = { ...lobby,
					online:true,
					player_id:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
				};
				if (game.currentphase < 0 ) { game.currentphase = 0; }
			});
			
			ws.on('join',(msg)=>{ console.log('join');
				msg = JSON.parse(msg);
				console.log(msg);
				game.players[msg.slot] = msg.player;
				if (game.players.reduce((acc,cur)=>acc + (cur.available) ? 1 : 0,0) == 0) finish();
			});
			ws.on('set',(msg)=>{ //console.log('set'); 
				console.log(JSON.parse(msg));
				game = {...JSON.parse(msg),phasse:game.phases,gamesequence:game.gamesequence};
			});
			func();
			ping();
		})
	}
	let fetchexistinggames = () => initSocket(()=> ws.emit('message',JSON.stringify({'header':'fetchexisting'})));
	let enterexistinggame = (g) => {
		let slot = g.players.reduce((acc,cur,i)=>(cur.available) ? i : acc,0);
		if (!lobby.init) initgame(g.number_of_players); 
		ws.emit('message',JSON.stringify({'header':'enterexisting',game_id:g.game_id,player_name:lobby.screename,slot:slot}));
	};
	let sendstate = () => ws.emit('message',JSON.stringify({...game,'header':'set','sender':lobby.player_id}));
	let registerws = () => ws.emit('message',JSON.stringify({...game,'header':'register','sender':lobby.player_id}));
	let initgame = (number_of_players) => {
		game.label = lobby.screenname;
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
	let gen_player_names = () => game.players.forEach((plyr,i)=>plyr.name = 'Player '+(i+1));
	let toggle_center_or_planets = () => game.displayinfo.center_or_planets = !game.displayinfo.center_or_planets;
	let togglepasstoplayer = () => {
		game.passtoplayer = !game.passtoplayer;
		openFullscreen();
	};
	let class_gen = (zone, item) => (game.displayinfo.selectionzone==zone) ? ((item.selected) ? "selected" : "selectable" )  : "bordered";
	
	let gen_game_id = () => {
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
	let drag = (evt,item) => () => game.displayinfo.dragged=item;
	let drop = (evt,zone) => () => {
		let el = document.getElementById('playedcards').getBoundingClientRect();
		if (evt.changedTouches[0].clientX > el.left
		&& evt.changedTouches[0].clientX < el.left+ el.width
		&& evt.changedTouches[0].clientY < el.top+el.height
		&& evt.changedTouches[0].clientY > el.top){
			if(game.displayinfo.dragged!==null) 
				choosewrapper(game.displayinfo.dragged,zone);
			game.displayinfo.dragged!=null;
		}
		let ll = document.querySelector('#dragged');
		ll.style.visibility="hidden";
	};
	let move = (evt, img) => () => {
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
	let newoffline = () => {
		lobby.online=false;
		game.currentphase = 0;
		initgame(2);
		finish();
	};
	let setplayername = (name) => {
		lobby.screename = name;
		phaseincrement();
	};
	let openFullscreen = () => {
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
	
	.hidden {
		display: none;
	}
	.hand img {
		height: 20vh;
		width: 14vh;
		margin-right: 5px;
		margin-left: 5px;
	}
	.settle_cost{
		position: relative;
		bottom: -webkit-calc(88% - 26px);
		right: 10%;
		text-align: right;
		font-size: 120%;
	}
	.conquer_cost{
		position: relative;
		bottom: 88%;
		left: 10%;
		text-align: left;
		font-size: 120%;
	}
	.planetfrontinfo{
		position: absolute;
		top: 0px;
	}
	.unsettled_costs {
		position: absolute;
		top: 0px;
	}
	.mini_settle_cost{
		position: relative;
		text-align: right;
		font-size: 80%;
	}
	.mini_conquer_cost{
		position: relative;
		text-align: left;
		font-size: 80%;
	}
	.hosted_colonies{
		position: relative;
		bottom: 38%;
		text-align: center;
		font-size: 120%;
	}
	.unsettled > img{
		width: auto;
		height: 100%;
	}
	.unsettled {
		height: 95%;
	}
	.mini_unsettled > img{
		width: auto;
		height: 100%;
	}
	.mini_unsettled {
		height: 100%;
	}
	.planetfront {
		font-weight: bolder;
		font-size: 50%;
		height: 100%;
		background-repeat: no-repeat;
	}
	.planetfront > div > img {
		flex-direction: column;
		height: 2em;
		background-repeat: no-repeat;
	}
	.planetfront > img {
		height: 100%;
	}
	.pass {
		background-repeat: no-repeat;
		height: 50px;
		min-width: 200px;
		background-image: url("/images/EMbutton200.png");
		align-self: center;
		text-align: center;
	}
	.pilecount{
		position:relative;
		font-size: 200%;
		bottom:20%;
	}
	.messagetoplayer{
		text-align: center;
		width:100%;
		position: absolute;
		top:75%;
	}
	.selectable{
		border: solid rgb(114, 210, 223);
		border-width: 4px;
		border-left-width: 2px;
		border-right-width: 2px;
	}
	.selected{
		border: solid rgb(50, 190, 132);
		border-width: 4px;
		border-left-width: 2px;
		border-right-width: 2px;
	}
	.centerrow div {
		max-width: 14vw;
		min-width: 14vw;
		margin-left: 5px;
		margin-right: 5px;
	}
	.flex {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.playerinfo {
		display: flex;
		flex-direction: row;
		justify-content:flex-start;
		width: 100%;
		height: 10%;
	}

	.playingfield {
		overflow: hidden;
		min-height:100vh;
		min-width: 100vw;
		min-height:100vh;
		min-width: 100vw;
		background-image: url("/images/embackground.png");
		background-repeat: no-repeat;
		background-size: cover;
	}
	.options, .talloptions{
		background-image: url("/images/embackground.png");
		background-repeat: no-repeat;
		display:flex; 
		flex-direction:row; 
		justify-content: space-around;
		position: absolute; 
		right:10%;
		top: 50%;
		height: 15%;
		width:80%;
		font-size: 150%;
	}
	.talloptions{
		height:30%;
	}
	.ownedcards{
		display: flex;
		flex-direction: row;
		height:20%;
		position: absolute;
		top:80%;
	}
	.hand{
		margin: auto;
		display: flex;
		flex-direction: row;
		max-width: 90%;
		max-height: 100%;
		overflow-x: scroll;
		overflow-y: hidden;
	}
	.hand > img{
		position:relative;
		
	}
	.deck{
		max-width: 5%;
		margin-right:auto;
	}
	.discard{
		max-width: 5%;
		margin-left:auto;
	}
	.zone {
		width: 100%;
		overflow-x: scroll;
		overflow-y: hidden;
		display:flex;
		flex-direction: row;
	}
	.centerrow{
		height:40%;
		position:absolute;
		top:15%;
	}
	.researchrow{
		height:40%;
	}
	.researchrow > div{
		height:95%;
	}
	.researchrow > div >img{
		width: auto;
		height: 100%;
	}
	.centerrow > div > img{
		height:100%;
	}
	.playedcards{
		height:20%;
		overflow-x:scroll;
		position:absolute;
		top:55%;
		justify-content: flex-start;
	}
	.minicard{
		height:100%;
	}
	.bordered{
		border: solid #000;
		border-width: 1px;
	}
	::-webkit-scrollbar { 
		display: none;  
	}
	.playercountselector > p {
		height:33%; 
		text-align: center; 
		font-size: 300%;
		background-color: rgb(34, 26, 59);
		border: solid #000;
		border-width: 1px;
	}
	.playercountselector > input {
		height:33%; 
		text-align: center; 
		width:100%;
		font-size: 300%;
		background-color: rgb(34, 26, 59);
		border: solid #000;
		border-width: 1px;
		color: rgb(49, 158, 177);
		padding: 0px;
		margin:0px;
	}
	.passtoplayer{
		height:80%;
		width:100%;
		top:10%;
		border: solid #000;
		border-width: 1px;
		text-align: center;
		font-size: 300%;
		color:white;
		background-color: rgb(34, 26, 59);

	}
</style>
{#if mounted}
	{#if game.currentphase==-4}
	<div class="playercountselector">
		<p> Choose your Screen Name</p>	
		<input type="text" bind:value={lobby.screenname} on:keypress={(e)=>{if(e.key=='Enter') setplayername(lobby.screenname)} }>
		<p on:click="{()=>setplayername(lobby.screenname)}" on:tap="{()=>setplayername(lobby.screenname)}">Finished</p>
	</div>
	{:else if game.currentphase==-3}
	<div class="playercountselector">
		<p on:click="{()=>phaseincrement()}" on:tap="{()=>phaseincrement()}">Start a New Online Game</p>
		<p on:click="{()=>fetchexistinggames()}" on:tap="{()=>fetchexistinggames()}">Join an Existing Online Game</p>
		<p on:click="{()=>newoffline()}" on:tap="{()=>newoffline()}">Start a New Offline Game</p>
	</div>
	{:else if game.currentphase==-2}
	<div class="playercountselector">
		<p> Choose your Game's number of Players</p>
		<p on:click={(e) => newgame(2)} on:tap={(e) => newgame(2)}>2</p>
		<p on:click={(e) => newgame(3)} on:tap={(e) => newgame(3)}>3</p>
		<p on:click={(e) => newgame(4)} on:tap={(e) => newgame(4)}>4</p>
	</div>
	{:else if game.currentphase==-1}
		<div class="playercountselector">
			<p>Choose a Game to Join</p>
			{#each lobby.existinggames as g}
				<p on:click="{()=>enterexistinggame(g)}" on:tap="{()=>enterexistinggame(g)}">{g.label+"'s Game"}</p>
			{/each}
		</div>
	{:else if game.passtoplayer && !lobby.online}
		<div class='passtoplayer' on:click="{()=>togglepasstoplayer()}" on:tap="{()=>togglepasstoplayer()}">
			pass to next player
		</div>
	{:else if !!game.winner}
		<div class='passtoplayer'>
			{game.winner} WON!!!!
		</div>
	{:else}
		<div id="screen" style="height:100%;width:100%;" class="flex">
			{#each game.players as player}
				{#if game.players[game.acting_player_index]!==undefined && ((lobby.screenname==player.name && lobby.online) || (game.players[game.acting_player_index].id==player.id && !lobby.online)) }
					<div class="bordered playingfield">
						<div id='dragged'></div>
						<div class="playerinfo bordered">
							{#each game.players as p}
								<div style="width:{100/game.number_of_players}%" class="flex {(game.players[game.acting_player_index] !== undefined && p.name == game.players[game.acting_player_index].name) ? 'selectable' : 'bordered'}">
									<div style="width:33%; text-align: center;" class="bordered"> Military Might {p.starfighters.small}</div>
									<div style="width:33%; text-align: center;" class="bordered"> Galactic Influence {p.influence.length}</div>
									<div style="width:33%; text-align: center;" class="bordered"> {p.name}</div>
								</div>
							{/each}
							<!-- <div style="width:100%; text-align: center;" class="bordered"> Remaining Influence throughout the Galaxy {game.influence.length}</div> -->
						</div>
						<!-- stacks / planets toggle -->
						<div on:click="{()=>toggle_center_or_planets()}" on:tap="{()=>toggle_center_or_planets()}">
							show {(game.displayinfo.center_or_planets) ? "planets" : "center row"}
						</div>
						<!-- stacks -->
						{#if game.displayinfo.selectionzone=='research'}
							<div class="zone researchrow">
								{#each game.research_deck as card}
								<div>
									<img src="{card.imgurl}" on:click="{()=>choosewrapper(card,'research')}" on:tap="{()=>choosewrapper(card,'research')}" class="{(game.displayinfo.selectionzone=='research') ? ( (card.selected) ? 'selected' : 'selectable' ): 'bordered'}" alt="{card.name}">
								</div>
								{/each}
							</div>
						{:else if game.displayinfo.center_or_planets}
							<div class="flex zone centerrow">
								{#if game.displayinfo.selectionzone=='rolecards'}
									{#each game.stacks.rolecards as card}
									<div>
										<img on:click="{()=>choosewrapper(card,'rolecards')}" on:tap="{()=>choosewrapper(card,'rolecards')}" on:touchmove="{(event)=>move(event, '/images/'+card.type+'.png','rolecards')}" on:touchstart="{(event)=>drag(event,card,'rolecards')}" on:touchend="{(event)=>drop(event,'rolecards')}" class="{(game.displayinfo.selectionzone=='rolecards') ? ( (card.selected) ? 'selected' : 'selectable' ): 'bordered'}" src="/images/{card.type}.png" alt="{card.name}">
										<div class="pilecount"> {game.stacks.pilecount[card.type]}</div>
									</div>
									{/each}
								{:else}
									{#each game.stacks.rolecards as card}
									<div>
										<img class="{(game.displayinfo.selectionzone=='rolecards') ? ( (card.selected) ? 'selected' : 'selectable' ): 'bordered'}" src="/images/{card.type}.png" alt="{card.name}">
										<div class="pilecount"> {game.stacks.pilecount[card.type]}</div>
									</div>
									{/each}
								{/if}
							</div>
						{/if}
						{#if !game.displayinfo.center_or_planets}
							<div class="flex zone centerrow">
								{#each player.unsettled_planets as planet}
									<div on:click="{()=>choosewrapper(planet,'unsettled_planets')}" on:tap="{()=>choosewrapper(planet,'unsettled_planets')}" class=" unsettled {(game.displayinfo.selectionzone=='unsettled_planets') ? ( (planet.selected) ? 'selected' : 'selectable' ): 'bordered'}">
										<img src="/images/{planet.type}back.png" alt='{planet.settle_cost} {planet.type} {planet.conquer_cost}'>
										<div class="settle_cost"> {planet.settle_cost}</div>
										<div class="conquer_cost"> {planet.conquer_cost}</div>
										<div class="hosted_colonies"> {planet.hosted_colonies.length} colonies</div>
									</div>
								{/each}
								{#each [...player.settled_planets, ...player.conquered_planets] as planet}
								<!-- if actingplayer.activerole or activeaction == trade and has weapons emporium as a permanent-->
								<!-- display psudeo planets that host a fighter resource that can be traded -->
									<div on:click="{()=>choosewrapper(planet,'settled_&_conquered_planets')}" on:tap="{()=>choosewrapper(planet,'settled_&_conquered_planets')}" class="{(game.displayinfo.selectionzone=='settled_&_conquered_planets') ? ( (planet.selected) ? 'selected' : 'selectable' ): 'bordered'}">
										<div  class="planetfront" style="font-size: 160%" >
											<img src="/images/{planet.type}100.png" alt='{planet.settle_cost} {planet.type} {planet.conquer_cost}'>	
											<!-- style="background-image: url('/images/{option.type}.png')" -->
											<!-- icons -->
											<div class="planetfrontinfo">
												{#if planet.icons.survey > 0}
													<img src="/images/surveyicon.png"  alt="survey"><br>
												{/if}
												{#if planet.icons.warfare > 0}
													<img src="/images/warfareicon.png"  alt="warfare"><br>
												{/if}
												{#if planet.icons.colonize > 0}
													<img src="/images/colonizeicon.png"  alt="colonize"><br>
												{/if}
												{#if planet.icons.research > 0}
													<img src="/images/researchicon.png"  alt="research"><br>
												{/if}
												{#if planet.icons.trade > 0}
													<img src="/images/tradeicon.png"  alt="trade"><br>
												{/if}
												{#if planet.icons.produce > 0}
													<img src="/images/produceicon.png"  alt="produce"><br>
												{/if}
												<!-- production zones -->
												{#each planet.production_zones as zone}
													<img src="/images/{zone.type}productionzoneicon.png"  alt="{zone.type} zone"><br>
												{/each}
												<!-- hand size mods -->
												{#if planet.handsize_modifier > 0}
													<img src="/images/handsizeicon.png"  alt="produce"><br>
												{/if}
												<!-- influence value -->
												<div>
													{planet.influence_value}
												</div>
												<img src="/images/influenceicon.png"  alt="influence">
												<!-- name  -->
												<div>
													{planet.name}
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
						<!-- played cards-->
						<div id="playedcards" class="flex zone playedcards" >
							{#if game.displayinfo.showoptiontoskip}
								<div style="margin-right:auto" class="selectable pass" on:click="{()=>choose([{name:'Skip'}])}" on:tap="{()=>choose([{name:'Skip'}])}">[Choose None]</div>
							{:else}
								<div style="margin-right:auto" class="bordered pass">[____]</div>
							{/if}
							{#each game.players[game.acting_player_index].limbo as card}
									{#if card.research_cost !== undefined}
									<div class="bordered minicard">
										<img class="minicard" src="{card.imgurl}"  alt="{card.name}" on:click="{()=>unchoose(card)}" on:tap="{()=>unchoose(card)}">
									</div>
									{:else if card.type != "advanced" && card.type != "fertile" && card.type != "metallic"}
										<div class="bordered minicard">
											<img class="minicard" src="/images/{card.type}.png"  alt="{card.name}" on:click="{()=>unchoose(card)}" on:tap="{()=>unchoose(card)}">
										</div>
									{/if}
								<!-- {/if} -->
							{/each}
							{#if game.passp }
								<div style="margin-left:auto" class="selectable pass" on:click="{()=>pass_priority()}"on:tap="{()=>pass_priority()}">[Pass to <br> Next Player]</div>
							{:else if game.passt}
								<div style="margin-left:auto" class="selectable pass" on:click="{()=>pass_turn()}" on:tap="{()=>pass_turn()}">[End Turn]</div>
							{:else if game.displayinfo.allowformultipleselections && game.choices.length>0}
								<div style="margin-left:auto" class="selectable pass" on:click="{()=>choose(game[game.displayinfo.choicelabel])}" on:tap="{()=>choose(game[game.displayinfo.choicelabel])}">[Choose Selected]</div>
							{:else}
								<div class="bordered pass" >[______]</div>
							{/if}
						</div>
						<div class="messagetoplayer bordered">{game.messagetoplayer[game.messagetoplayer.length-1]}</div>
						<!-- hand -->
						<div class="flex zone ownedcards">
							<div class='bordered deck'> cards remaining in deck: {player.deck.length}</div>
							<div class='hand'>
								{#each player.hand as card}
									{#if game.displayinfo.selectionzone=='hand'}
										{#if card.research_cost !== undefined}
											<img src="{card.imgurl}"  alt="{card.name}" on:touchstart="{(event)=>drag(event, card,'hand')}" on:touchend="{(event)=>drop(event,'hand')}" on:touchmove="{(event)=>move(event, card.imgurl,'hand')}" on:click="{()=>choosewrapper(card,'hand')}" on:tap="{()=>choosewrapper(card,'hand')}" class="cutcard {(game.displayinfo.selectionzone=='hand') ? ( (card.selected) ? 'hidden' : 'selectable' ): 'bordered'}">
										{:else}
											<img src="/images/{card.type}.png" alt="{card.name}" on:touchstart="{drag((event)=>event,card,'hand')}" on:touchend="{(event)=>drop(event,'hand')}" on:click="{()=>choosewrapper(card,'hand')}" on:touchmove="{(event)=>move(event, '/images/'+card.type+'.png','hand')}" on:tap="{()=>choosewrapper(card,'hand')}" class="cutcard {(game.displayinfo.selectionzone=='hand') ? ( (card.selected) ? 'hidden' : 'selectable' ): 'bordered'}">
										{/if}
									{:else}
										{#if card.research_cost !== undefined}
											<img src="{card.imgurl}" alt="{card.name}" class="cutcard {(game.displayinfo.selectionzone=='hand') ? ( (card.selected) ? 'selected' : 'selectable' ): 'bordered'}">
										{:else}
											<img src="/images/{card.type}.png" alt="{card.name}" class="cutcard {(game.displayinfo.selectionzone=='hand') ? ( (card.selected) ? 'selected' : 'selectable' ): 'bordered'}">
										{/if}
									{/if}	
								{/each}
							</div>
							<div class="bordered discard"> cards in discard pile: {player.discard.length}</div>
						</div>
					</div>
				{/if}
			{/each}
			<!-- game.options -->
			{#if game.displayinfo.selectionzone=='options'}
				<div class="{( game.options[0] !== undefined && game.options[0].type !== undefined) ? 'talloptions' : 'options'}">
					{#each game.options as option}
						{#if option.type !== undefined}
							
						<div class="bordered flex {(game.displayinfo.selectionzone=='options') ? ( (option.selected) ? 'selected' : 'selectable' ): 'bordered'}" on:click="{()=>choosewrapper(option,'options')}" on:tap="{()=>choosewrapper(option,'options')}" >
							<div  class="planetfront" >
								<img src="/images/{option.type}100.png" alt='{option.settle_cost} {option.type} {option.conquer_cost}'>	
								<!-- style="background-image: url('/images/{option.type}.png')" -->
								<!-- icons -->
								<div class="planetfrontinfo">
									{#if option.icons.survey > 0}
										<img src="/images/surveyicon.png"  alt="survey"><br>
									{/if}
									{#if option.icons.warfare > 0}
										<img src="/images/warfareicon.png"  alt="warfare"><br>
									{/if}
									{#if option.icons.colonize > 0}
										<img src="/images/colonizeicon.png"  alt="colonize"><br>
									{/if}
									{#if option.icons.research > 0}
										<img src="/images/researchicon.png"  alt="research"><br>
									{/if}
									{#if option.icons.trade > 0}
										<img src="/images/tradeicon.png"  alt="trade"><br>
									{/if}
									{#if option.icons.produce > 0}
										<img src="/images/produceicon.png"  alt="produce"><br>
									{/if}
									<!-- production zones -->
									{#each option.production_zones as zone}
										<img src="/images/{zone.type}productionzoneicon.png"  alt="{zone.type} zone"><br>
									{/each}
									<!-- hand size mods -->
									{#if option.handsize_modifier > 0}
										<img src="/images/handsizeicon.png"  alt="produce"><br>
									{/if}
									<!-- influence value -->
									<div>
										{option.influence_value}
									</div>
									<img src="/images/influenceicon.png"  alt="influence">
									<!-- name  -->
									<div>
										{option.name}
									</div>
								</div>
							</div>
							<div>
								<!-- colonize cost -->
								<!-- conquer cost -->
								<div class="mini_unsettled">
									<img src="/images/{option.type}back100.png" alt='{option.settle_cost} {option.type} {option.conquer_cost}'>
									<div class="unsettled_costs">
										<span class="mini_settle_cost"> {option.settle_cost}</span>
										<span class="mini_conquer_cost"> {option.conquer_cost}</span>
									</div>
								</div>
							</div>
						</div>
						{:else}
							<div class="pass {(game.displayinfo.selectionzone=='options') ? ( (option.selected) ? 'selected' : 'selectable' ): 'bordered'}" on:click="{()=>choosewrapper(option,'options')}" on:tap="{()=>choosewrapper(option,'options')}">
								{option.name}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}
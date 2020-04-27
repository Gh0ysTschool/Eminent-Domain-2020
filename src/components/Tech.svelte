<script> 
import IconBar from '../components/IconBar.svelte';
import Icon from '../components/Icon.svelte';
import { onMount } from 'svelte';
const desc = {
    " ":{"desc":{
        "role":"",
        "action":""}},
    "survey": {"desc":{
        "role":"Look at <icon>survey<icon> -1 planet cards, keep 1 \n Leader: Look at 1 additional card",
        "action":"Draw 3 cards"}},
    "warfare": {"desc":{
        "role":"Collect 1 fighter per <icon>warfare<icon> \n Leader: May attack 1 planet instead",
        "action":"Attack 1 planet OR collect 1 fighter"}},
    "colonize": {"desc":{
        "action":"Settle 1 planet OR +1 colony",
        "role":"+1 colony per <icon>colonize<icon> \n Leader: May settle 1 planet instead"}},
    "producetrade": {"desc":{
        "action":"Produce 1 resource OR Trade 1 resource",
        "role":"Produce 1 resource per <icon>produce<icon> OR Trade 1 resource per <icon>trade<icon> \n Leader: +<icon>produce<icon> OR <icon>trade<icon>"}},
    "research": {"desc":{
        "action":"Remove up to 3 cards in your and from the game",
        "role":"Auire 1 technology card after satisfying <icon>research<icon> costs and planet requirements \n Leader: +<icon>research<icon>"}},
    "politics": {"desc":{
        "action":"Remove tis card from the game. Place any 1 role card from the stacks into your hand",
        "role":""}},
    "improved_trade": {"desc":{
        "action":"Collect 1 influence from the supply",
        "role":""}},
    "improved_research": {"desc":{
        "action":"Draw 1 card. Remove up to 3 cards in your hand from the game",
        "role":""}},
    "improved_production": {"desc":{
        "action":"Produce 2 resources",
        "role":""}},
    "improved_warfare": {"desc":{
        "action":"Collect 2 fighter OR Attack 1 planet",
        "role":""}},
    "improved_colonize": {"desc":{
        "action":"Settle 1 planet (optional). \n Settle another planet OR +1 colony",
        "role":""}},
    "improved_survey": {"desc":{
        "action":"Draw 3 cards",
        "role":""}},
    "survey_team": {"desc":{
        "action":"Take the top card of the planet deck and put it face down into your empire",
        "role":""}},
    "war_path": {"desc":{
        "action":"Attack up to 2 planets",
        "role":""}},
    "terraforming": {"desc":{
        "action":"Add this card to a planet as 2 colonies. If that fulfills the printed colonize cost, settle the planet \n (ignore colonize cost discounts)",
        "role":""}},
    "genetic_engineering": {"desc":{
        "action":"Collect +1 influence for each TYPE of resource you produce this turn",
        "role":""}},
    "artificial_intelligence'": {"desc":{
        "action":"Place any 2 role cards from the stacks into your hand",
        "role":""}},
    "diverse_markets": {"desc":{
        "action":"Collect +1 influence for each TYPE of resource you trade this turn",
        "role":""}},
    "specialization": {"desc":{
        "action":"Choose 1 resource TYPE. Collect +1 influence for each resource of that TYPE you trade this turn",
        "role":""}},
    "mobilization": {"desc":{
        "action":"Collect 2 fighter. You may attack 1 planet after your role phase this turn",
        "role":""}},
    "data_network": {"desc":{
        "action":"Draw 2 cards. Remove any number of cards in your hand from the game",
        "role":""}},
    "abundance": {"desc":{
        "action":"Planets you settle or attack come into play with all resource slots filled",
        "role":""}},
    "adaptability": {"desc":{
        "action":"Your standard research role cards gain all symboles. They can be used to boost or follow any role",
        "role":""}},
    "bureaucracy": {"desc":{
        "action":"You may use the leader bonus when following the colonize or warfare roles",
        "role":""}},
    "dissension": {"desc":{
        "action":"Draw 1 dditional card when dissenting",
        "role":""}},
    "hyperefficiency": {"desc":{
        "action":"You may remove any number of cards in your hand form the game each turn",
        "role":""}},
    "imperialism": {"desc":{
        "action":"<icon>survey<icon> <icon>trade<icon> <icon>warfare<icon>",
        "role":""}},
    "logistics": {"desc":{
        "action":"Play the action and role phases of your turn in any order",
        "role":""}},
    "productivity": {"desc":{
        "action":"You may play an additional card for its action effect during your action phase",
        "role":""}},
    "scorched_earth_policy": {"desc":{
        "action":"-2 to our warfare costs. When you attack a planet, leave a fight on it. that planet cannot store resources",
        "role":""}},
    "streamlining": {"desc":{
        "action":"You may remove 1 card in your hand from the game each turn",
        "role":""}},
    "weapons_emporium": {"desc":{
        "action":"You may trade fighters as if they were resources (fighter is not a resource TYPE)",
        "role":""}},
    "fertile_grounds": {"desc":{
        "role":"<icon>colonize<icon> <icon>produce<icon> <icon>research<icon>",
        "action":""}}
    }
    let hashCode = (str,i=0) => {
        console.log('str',str);
        console.log('length',str.length);
        return ( i >= str.length ) ? 0 : 
        hashCode(str,i+1) + 
        ((str.charCodeAt(i) << 5) - 
        str.charCodeAt(i));
    };
    let intToARGB = (i) =>  {let rgb = (((i>>24)&0xFF).toString(16) + ((i>>16)&0xFF).toString(16) + ((i>>8)&0xFF).toString(16) + (i&0xFF).toString(16)); rgb+='000000'; return rgb.substring(0, 6);};
    String.prototype.toHexColour = () => intToARGB(hashCode(this));
    export let card={name:" "}, selectable=false, mini=false;
    let color,bg,logoBg;
    onMount(()=>{
        console.log('card name',card.name);
        color = '#' + intToARGB(hashCode(card.name));
        bg = `color:${color};background-image:linear-gradient( rgb(80,80,80),  rgb(80,80,80) 5vh,  rgb(80,80,80) 5vh,  ${color} 8vh,  ${color} 8vh,  ${color} 12vh,  ${color} 12vh,  rgb(80,80,80) 16vh );`;
        logoBg = `background-color: ${color};`;
    })

</script>

<style>
	@import url(https://unpkg.com/@smui/card@latest/bare.css);
	.mdc-card {
		overflow:hidden;
		padding:1vh;
		min-height: 30vh; 
		min-width: 19vh; 
		max-height: 30vh; 
		max-width: 19vh; 
		margin-left:1vh;
		margin-right:1vh;
    }
    .mdc-card.mini {
		min-height: 16vh;
		max-height: 16vh;
    }
	.title {
		display:flex;
		flex-direction: row;
		max-height: 3vh;
		min-height: 3vh;
		font: 2vh bold;
	}
	.title p {
		margin-top: auto;
		margin-bottom: auto;
		margin-left:1vh;
	}
	.logo {
		height:12vh;
		width:12vh;
		margin-left:3vh;
		border-radius: 10vh 0vh 10vh 0vh;
		border: .25vh solid black;
		transform:rotate(45deg);
	}
	.logo img{
		margin-left:2.25vh;
		margin-top:2vh;
		height:7.5vh;
		width:7.5vh;
		transform: rotate(-45deg);
		overflow:hidden;
	}
	.desc {
		position:relative;
		font: 1vh bold;
		line-height : 1.2;
	}
	.action {
		position:relative;
		border: 0.05vh solid black;
		padding: 0.5vh;
	}
	.action:after {
		position:absolute;
		background: rgb(80,80,80);
		height:1vh;
		left:.5vh;
		top:-.5vh;
	}
	.action:after {
		content:'Action';
	}
</style>
<div class="mdc-card {(selectable) ? (card.selected) ? 'selected' : 'selectable' : 'bordered'} {(mini) ? 'mini' : '' }" style={bg} on:click on:touch on:touchstart on:touchend on:tap on:touchmove>
    <div class="title">
        <IconBar {...card.icons}/>
        <p>{card.name}</p>
    </div>
    <div class="logo" style ={logoBg}>
        <img src="./images/tech.svg" alt="{card.name}">
    </div>
    {#if !mini}
        <div class="desc">
        {#if desc[card.type] !== undefined}
            <p class="action">
                {#each desc[card.type].desc.action.split('<icon>') as piece}
                    {#if ['survey','warfare','colonize','research','produce','trade'].includes(piece)} <Icon type={piece} size='sm'/> 
                    {:else} {piece}
                    {/if}
                {/each}
            </p>
        {/if}
        <!-- <div class='res-cost'>
                <p></p>
                <Icon/>
            </div>
            <div class='plan-req'>
                <Icon/>
            </div> -->
        </div> 
    {/if}
</div>
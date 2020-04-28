<script>
	import Icon from '../components/Icon.svelte';
	import Tech from '../components/Tech.svelte';
	import PlanetCard from '../components/PlanetCard.svelte';
	import {beforeUpdate} from 'svelte';
	export let card, selectable = false, pilecount ='', mini = false;
	let label,key,bg,logoBg;
    $:{ label = card.type.charAt(0).toUpperCase() + card.type.slice(1),
        key = {producetrade:false,produce:'pro',trade:'trd',research:'res',politics:'pol',survey:'sur',warfare:'war',colonize:'col'}[card.type],
        bg = (!key) ? `color:var(--pro-color);background-image:linear-gradient( rgb(80,80,80),  rgb(80,80,80) 5vh,  rgb(80,80,80) 5vh,  var(--pro-color) 8vh,  var(--pro-color) 8vh,  var(--trd-color) 12vh,  var(--trd-color) 12vh,  rgb(80,80,80) 16vh );`
                    : `color:var(--${key}-color);background-image:linear-gradient( rgb(80,80,80),  rgb(80,80,80) 5vh,  rgb(80,80,80) 5vh,  var(--${key}-color) 8vh,  var(--${key}-color) 8vh,  var(--${key}-color) 12vh,  var(--${key}-color) 12vh,  rgb(80,80,80) 16vh );`,
        logoBg = (!key) ? `background: var(--pro-trd-clr);` : `background-color: var(--${key}-color);`;
	}
	let desc = {
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
			"role":"Aquire 1 technology card after satisfying <icon>research<icon> costs and planet requirements \n Leader: +<icon>research<icon>"}},
		"politics": {"desc":{
			"action":"Remove tis card from the game. Place any 1 role card from the stacks into your hand",
			"role":""}},
		}


	beforeUpdate(()=>{
		card.type = card.type+'';
	})
	</script>
<style>
	@import url(https://unpkg.com/@smui/card@latest/bare.css);
	:root {
		--pro-color:rgb(255, 255, 119);
		--col-color:rgb(255, 184, 102);
		--trd-color:rgb(255, 169, 241);
		--pol-color:rgb(209, 186, 143);
		--res-color:rgb(119, 183, 255);
		--war-color:rgb(255, 98, 98);
		--sur-color:rgb(143, 255, 143);
		--pro-trd-clr:linear-gradient(to right, var(--pro-color), var(--pro-color) 50%, var(--trd-color) 50%, var(--trd-color) 100%);
	}
	
	.selectable{
		border: solid rgb(114, 210, 223);
		border-width: 1px;
	}
	
	.selected{
		border: solid rgb(50, 190, 132);
		border-width: 1px;
	}
	.mdc-card {
		position: relative;
		overflow:hidden;
		padding:1vh;
		height: 30vh; 
		width: 19vh; 
		margin-left:1vh;
		margin-right:1vh;
    }
    .mdc-card.mini {
		min-height: 16vh;
		max-height: 16vh;
    }
    .logo div {
        transform: rotate(-45deg) scale(1.7);
        margin-top: 2.9vh;
        margin-left: 2.8vh;
    }
	.title {
		display:flex;
		flex-direction: row;
		max-height: 3vh;
		min-height: 3vh;
		overflow:hidden;
		font: 2vh bold;
	}
	.title p {
		margin-top: auto;
		margin-bottom: auto;
		margin-left:1vh;
	}
	.logo {
		min-height:12vh;
		min-width:12vh;
		max-height:12vh;
		max-width:12vh;
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
	.role, .action {
		position:relative;
		border: 0.05vh solid black;
		padding: 0.5vh;
	}
	.role:after, .action:after {
		position:absolute;
		background: rgb(80,80,80);
		height:1vh;
		left:.5vh;
		top:-.5vh;
	}
	.role:after {
		content:'Role';
	}
	.action:after {
		content:'Action';
	}
	.pilecount{
		position:absolute;
		left:5%;
		bottom:3%;
	}
</style>
{#if (card.type=='planet'||card.type=='advanced'||card.type=='metallic'||card.type=='fertile')}
	<PlanetCard planet={card} {selectable} {mini}/>		
{:else if !['survey','warfare','colonize','research','producetrade','politics'].includes(card.type)} 
	<Tech {card} {selectable} {mini}/>
{:else}
	<div class="mdc-card {(selectable) ? (card.selected) ? 'selected' : 'selectable' : 'bordered'} {(mini) ? 'mini' : '' }" style={bg} on:click on:touch on:touchstart on:touchend on:tap on:touchmove>
		<div class="title">
		{#if (!key)} 
			<Icon type='produce' size='sm'/>
			<Icon type='trade' size='sm'/>
		{:else}
			<Icon type={card.type} size='sm'/>
		{/if}
		<p>{label}</p>
		</div>
		<div class="logo" style ={logoBg}>
		{#if (!key)} 
			<div style='display:flex;flex-direction:row;'>
				<Icon type='produce' size='sm'/>
				<Icon type='trade' size='sm'/>
			</div>
		{:else}
			<img src="./images/{key}.svg" alt="{key}">
		{/if}
		</div>
		
		{#if !mini}
			<div class="desc">
				{#if desc[card.type] !== undefined}
					<p class="action">
						{#each desc[card.type].desc.action.split('<icon>') as piece}
							{#if ['survey','warfare','colonize','research','produce','trade','politics'].includes(piece)} <Icon type={piece} size='sm'/> 
							{:else} {piece}
							{/if}
						{/each}
					</p>
					<p class="role">
						{#each desc[card.type].desc.role.split('<icon>') as piece}
							{#if ['survey','warfare','colonize','research','produce','trade','politics'].includes(piece)} <Icon type={piece} size='sm'/> 
							{:else} {piece}
							{/if}
						{/each}
					</p>
				{/if}
			</div>
			<div class='pilecount'>{pilecount} remaining</div>
		{/if}
	</div>
{/if}
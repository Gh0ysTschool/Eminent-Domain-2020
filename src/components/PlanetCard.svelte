<script> 
import IconBar from '../components/IconBar.svelte';
import Icon from '../components/Icon.svelte';
import { onMount } from 'svelte';

    export let planet={name:" "}, selectable=false, mini=false;
let key = {advanced:'adv', fertile:'fer', metallic:'met',}[planet.type];
    let color,bg,logoBg;
    console.log(planet);
    onMount(()=>{
        color =  (key=='fer') ? 'rgb(148, 197, 152)' : (key=='adv') ? 'rgb(231, 184, 215)' : 'rgb(187, 55, 55)';
        bg = `color:${color};background:radial-gradient(circle at 50% 33%, ${color}, rgb(80,80,80) 30%)`
        logoBg = `background-color: ${color};`;
    })

</script>

<style>
	@import url(https://unpkg.com/@smui/card@latest/bare.css);
	.mdc-card {
		overflow:hidden;
		padding:1vh;
		min-height: 30vh; 
		min-width: 21vh; 
		max-height: 30vh; 
		max-width: 21vh; 
		margin-left:1vh;
		margin-right:1vh;
        position:relative;
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
		font: 1.5vh bold;
        text-align: end;
	}
	.logo {
		height:12vh;
		width:12vh;
		margin-left:3vh;
		border-radius: 10vh 0vh 10vh 0vh;
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
    .name {
        position: absolute;
        top:20%;
        left:2%;
        transform: rotate(90deg);
        transform-origin: bottom left;
        font-size:1.6vh;
        border-radius: 5px;
        background:rgb(100,100,100);
        padding-left:1em;
        padding-right:1em;
    }
</style>
    <div class="mdc-card {(selectable) ? (planet.selected) ? 'selected' : 'selectable' : 'bordered'} {(mini) ? 'mini' : '' }" style={bg} on:click on:touch on:touchstart on:touchend on:tap on:touchmove>
        {#if planet.settled}
            <div class="title"> 
                <IconBar {...planet.icons}/>  
                <span style="margin-left:15vh">
                    <Icon type='influence' size='sm' influence={planet.influence}/>
                </span>
            </div>

            <div class="logo">
                <img src="./images/{key}.svg" alt="{planet.name}">
            </div>
            <div class='name'>{planet.name}</div>
            <div style="position:absolute; bottom:3%; width:15%; height 15%; text-align: center;">
                {#each planet.production_zones as zone}
                    <Icon type={zone.type} size="sm" bordered={zone.filled}/>
                {/each}
            </div>
        {:else}
            <div class="title"> Surveying Alien World  </div>
            <div class="logo">
                <img src="./images/col.svg" alt="{planet.name}">
            </div>
            <div style="display:inline-block">
                <span style="float:left">
                    {planet.settle_cost}
                    <Icon type="colonize" size="sm"/>
                </span>
                <span style="float:right">
                    <Icon type="warfare" size="sm"/>
                    {planet.conquer_cost}
                </span>
            </div>
            <div style="position:absolute; bottom:3%; width:85%; text-align: center; border: 1px solid black;">{planet.type}</div>
    {/if}
</div>
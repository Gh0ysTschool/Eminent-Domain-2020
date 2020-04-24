<script>
import Icon from '../components/Icon.svelte'
  export let card;
  let label = card.type.charAt(0).toUpperCase() + card.type.slice(1),
        key = {producetrade:false,produce:'pro',trade:'trd',research:'res',politics:'pol',survey:'sur',warfare:'war',colonize:'col'}[card.type],
        bg = (!key) ? `color:var(--pro-color);background-image:linear-gradient( rgb(80,80,80),  rgb(80,80,80) 5vh,  rgb(80,80,80) 5vh,  var(--pro-color) 8vh,  var(--pro-color) 8vh,  var(--trd-color) 12vh,  var(--trd-color) 12vh,  rgb(80,80,80) 16vh );`
                    : `color:var(--${key}-color);background-image:linear-gradient( rgb(80,80,80),  rgb(80,80,80) 5vh,  rgb(80,80,80) 5vh,  var(--${key}-color) 8vh,  var(--${key}-color) 8vh,  var(--${key}-color) 12vh,  var(--${key}-color) 12vh,  rgb(80,80,80) 16vh );`,
        logoBg = (!key) ? `background: var(--pro-trd-clr);` : `background-color: var(--${key}-color);`;
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
	.mdc-card {
		overflow:hidden;
		padding:1vh;
		height: 30vh; 
		width: 21vh; 
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
</style>
<div class="mdc-card" style={bg}>
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
    <div class="desc">
    <p class="role">Role:</p>
    <p class="action">Action:</p>
    </div>
</div>
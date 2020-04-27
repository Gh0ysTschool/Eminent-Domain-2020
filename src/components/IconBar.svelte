<script>
    import Icon from '../components/Icon.svelte';
    export let survey, warfare, colonize, produce, trade, research;
    let icons = [];
    let f = (c,s) => { for (let i = 0; i < c; i++) icons = [...icons, {size:'sm',type:s}]; }
    f(survey,"survey");
    f(warfare,"warfare");
    f(colonize,"colonize");
    f(produce,"produce");
    f(trade,"trade");
    f(research,"research");
    let size = `min-height: calc(${icons.length}*2em);max-height: calc(${icons.length}*2em);`;
</script>
<style>
    .iconbar {
        display:flex;
        flex-direction: column;
        justify-content: flex-start;
    }
</style>
<div class="iconbar" style={size}>
    {#each icons as icon}
        <Icon {...icon}/>
        <div style="min-height:0.1vh;max-height:0.1vh;"></div>
    {/each}
</div>
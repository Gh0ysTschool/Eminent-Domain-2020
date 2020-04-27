<script>
    export let type,size,influence=0,bordered=false;
    let label = type.charAt(0).toUpperCase() + type.slice(1),
        key = {produce:'pro',trade:'trd',politics:'pol',research:'res',survey:'sur',warfare:'war',colonize:'col',
        water:'wtr', food:'fud', silicon:'sil', ore:'ore', advanced:'adv', fertile:'fer', metallic:'met',influence:'inf'}[type];
</script>
<style>
    .pro {
        background-color : rgb(255, 255, 119);
    }
    .res {
        background-color : rgb(119, 183, 255);
    }
    .trd {
        background-color : rgb(255, 169, 241);
    }
    .pol {
        background-color : rgb(209, 186, 143);
    }
    .sur {
        background-color : rgb(143, 255, 143);
    }
    .war {
        background-color : rgb(255, 98, 98);
    }
    .col {
        background-color : rgb(255, 184, 102);
    }
    .fer {
        background-color : rgb(148, 197, 152);
    }
    .adv {
        background-color : rgb(231, 184, 215);
    }
    .met {
        background-color : rgb(187, 55, 55);
    }
    .fud {
        background-color : rgb(255, 215, 142);
    }
    .ore {
        background-color : rgb(212, 139, 56);
    }
    .wtr {
        background-color : rgb(115, 141, 253);
    }
    .sil {
        background-color : rgb(161, 45, 255);
    }
    .ico-sm {
        padding:.2em;
        height:.8em;
        width:.8em;
    }
    .ico-cont-lg, .ico-cont-sm {
        display: inline-block;
        overflow: hidden;
        position:relative;
		border-radius: 50%;
    }
    .ico-cont-sm {
        height:1.2em;
        width:1.2em;
    }
    .ico-lg {
        height:2em;
        width:2em;
    }
    .ico-cont-lg {
        height:2em;
        width:2em;
    }
    .inf {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        background: grey;
    }
    .num {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: .5vh;
    }
</style>
{#if type=='influence'}
<div class='ico-cont-{size}' style='{(bordered)?'border:1px solid black':''}'>
    <img  class='ico-{size} inf' style='transform: translate(-15%, 5%);;' src='./images/{key}.svg' alt={key}>
    <span class='num'>{influence}</span>
</div>
{:else}
<div class='ico-cont-{size} {key}'>
    <img class='ico-{size}' src='./images/{key}.svg' alt={key}>
</div>
{/if}
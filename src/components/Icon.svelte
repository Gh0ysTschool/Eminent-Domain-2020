<script>
    export let type,size;
    let label = type.charAt(0).toUpperCase() + type.slice(1),
        key = {produce:'pro',trade:'trd',politics:'pol',research:'res',survey:'sur',warfare:'war',colonize:'col'}[type];
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
    .ico-sm {
        padding:.2em;
        height:.8em;
        width:.8em;
    }
    .ico-cont-sm {
        overflow: hidden;
		border-radius: 50%;
        height:1.2em;
        width:1.2em;
    }
    .ico-lg {
        height:2em;
        width:2em;
    }
    .ico-cont-lg {
        overflow: hidden;
		border-radius: 50%;
        height:2em;
        width:2em;
    }
</style>
<div class='ico-cont-{size} {key}'>
    <img class='ico-{size}' src='./images/{key}.svg' alt={key}>
</div>